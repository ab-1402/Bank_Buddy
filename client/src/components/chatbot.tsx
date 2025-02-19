import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal } from "lucide-react";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
};

const responses = {
  balance: "You can check your balance at the top of the dashboard.",
  transaction: "Your recent transactions are shown in the transaction history section.",
  fraud: "If you notice any suspicious activity, please check the fraud alerts section.",
  help: "I'm here to help! You can ask me about your balance, transactions, or fraud alerts.",
};

function getBotResponse(input: string): string {
  const lowercaseInput = input.toLowerCase();
  
  if (lowercaseInput.includes("balance")) return responses.balance;
  if (lowercaseInput.includes("transaction")) return responses.transaction;
  if (lowercaseInput.includes("fraud")) return responses.fraud;
  return responses.help;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    };

    const botMessage: Message = {
      id: messages.length + 2,
      text: getBotResponse(input),
      sender: "bot",
    };

    setMessages([...messages, userMessage, botMessage]);
    setInput("");
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
