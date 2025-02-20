import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Account } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
};

type TransferState = {
  step: "initial" | "upi" | "amount" | "confirm" | "none";
  upiId?: string;
  amount?: number;
};

const formatCurrency = (amount: string | number) => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

type ChatbotProps = {
  onClose?: () => void;
};

export default function Chatbot({ onClose }: ChatbotProps) {
  const { user } = useAuth();
  const { data: userData } = useQuery({
    queryKey: ['/api/user'],
  });

  const balance = userData?.balance ?? 0;
  const [transferState, setTransferState] = useState<TransferState>({ step: "none" });

  const { data: upiAccount, isLoading: isUpiLoading } = useQuery<Account>({
    queryKey: ['/api/accounts/upi', transferState.upiId],
    enabled: !!transferState.upiId && transferState.step === "initial",
  });

  const transferMutation = useMutation({
    mutationFn: async ({ amount, toUpiId }: { amount: number, toUpiId: string }) => {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, toUpiId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transfer failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
  });

  const responses = {
    balance: `Your balance is ${formatCurrency(balance)}.`,
    transaction: `Your recent 3 transactions are:
1) Salary Deposit: ${formatCurrency(415000)}
2) Rent paid: ${formatCurrency(12500)}
3) Transfer to xxxxxx123: Rohan: ${formatCurrency(124500)}`,
    fraud: "If you notice any suspicious activity, please check the fraud alerts section.",
    help: "I'm here to help! You can ask me about your balance, transactions, fraud alerts, or transferring money.",
    transfer: {
      initial: "Sure, I can help you transfer money. Please provide the UPI ID of the receiver.",
      upi: "Great! Now please enter the amount you want to transfer.",
      upiNotFound: (upiId: string) => `Sorry, the UPI ID ${upiId} was not found in our system. Please check and try again.`,
      amount: (amount: number, upiId: string, accountHolder: string) =>
        `You're about to transfer ${formatCurrency(amount)} to ${accountHolder} (${upiId}). Please confirm by typing 'yes' or 'no'.`,
      insufficient: (amount: number) =>
        `Sorry, you don't have sufficient balance to transfer ${formatCurrency(amount)}. Your current balance is ${formatCurrency(balance)}.`,
      success: (amount: number, accountHolder: string) =>
        `Successfully transferred ${formatCurrency(amount)} to ${accountHolder}.`,
      cancelled: "Transfer cancelled. Is there anything else I can help you with?",
      invalid: "Please enter a valid amount (numbers only).",
      loading: "Please wait while I verify the UPI ID..."
    }
  };

  async function handleTransfer(input: string): Promise<string> {
    switch (transferState.step) {
      case "initial":
        const cleanUpiId = input.trim();
        setTransferState({ step: "initial", upiId: cleanUpiId });

        try {
          const response = await fetch(`/api/accounts/upi/${cleanUpiId}`);
          if (!response.ok) {
            setTransferState({ step: "none" });
            return responses.transfer.upiNotFound(cleanUpiId);
          }
          const account = await response.json();
          setTransferState({ step: "upi", upiId: cleanUpiId });
          return responses.transfer.upi;
        } catch (error) {
          setTransferState({ step: "none" });
          return responses.transfer.upiNotFound(cleanUpiId);
        }

      case "upi":
        const amount = parseFloat(input);
        if (isNaN(amount) || amount <= 0) {
          return responses.transfer.invalid;
        }
        if (amount > parseFloat(balance.toString())) {
          setTransferState({ step: "none" });
          return responses.transfer.insufficient(amount);
        }
        setTransferState({ ...transferState, step: "confirm", amount });
        return responses.transfer.amount(amount, transferState.upiId!, upiAccount!.accountHolderName);

      case "confirm":
        if (input.toLowerCase() === "yes" && transferState.amount && transferState.upiId) {
          try {
            await transferMutation.mutateAsync({
              amount: transferState.amount,
              toUpiId: transferState.upiId
            });
            const result = responses.transfer.success(transferState.amount, upiAccount!.accountHolderName);
            setTransferState({ step: "none" });
            return result;
          } catch (error) {
            setTransferState({ step: "none" });
            return error instanceof Error ? error.message : "Sorry, the transfer failed. Please try again later.";
          }
        } else {
          setTransferState({ step: "none" });
          return responses.transfer.cancelled;
        }

      default:
        return responses.transfer.initial;
    }
  }

  function getBotResponse(input: string): string | Promise<string> {
    const lowercaseInput = input.toLowerCase();

    if (transferState.step !== "none") {
      return handleTransfer(input);
    }

    if (lowercaseInput.includes("transfer") || lowercaseInput.includes("send money")) {
      setTransferState({ step: "initial" });
      return responses.transfer.initial;
    }
    if (lowercaseInput.includes("balance")) return responses.balance;
    if (lowercaseInput.includes("transaction")) return responses.transaction;
    if (lowercaseInput.includes("fraud")) return responses.fraud;
    return responses.help;
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const response = await getBotResponse(input);

    const botMessage: Message = {
      id: messages.length + 2,
      text: response,
      sender: "bot",
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <Button type="submit" size="icon">
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}