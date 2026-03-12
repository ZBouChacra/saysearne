import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageSquare, Send, Loader2, ArrowLeft, Image, MapPin } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export default function Chats() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  if (loading) return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <h1 className="font-serif text-3xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-primary" /> {t("chats.title")}
        </h1>

        <div className="border border-border bg-card" style={{ minHeight: "500px" }}>
          <div className="flex h-full" style={{ minHeight: "500px" }}>
            <div className={`w-full md:w-80 border-e border-border ${selectedRoom ? "hidden md:block" : ""}`}>
              <RoomList userId={user.id} selectedRoom={selectedRoom} onSelect={setSelectedRoom} />
            </div>

            <div className={`flex-1 ${!selectedRoom ? "hidden md:flex" : "flex"} flex-col`}>
              {selectedRoom ? (
                <ChatArea roomId={selectedRoom} userId={user.id} onBack={() => setSelectedRoom(null)} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>{t("chats.selectChat")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function RoomList({ userId, selectedRoom, onSelect }: { userId: number; selectedRoom: number | null; onSelect: (id: number) => void }) {
  const { t } = useLanguage();
  const { data: rooms, isLoading } = trpc.chat.rooms.useQuery(undefined, { refetchInterval: 5000 });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  if (!rooms || rooms.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p className="text-sm">{t("chats.noChats")}</p>
        <p className="text-xs mt-1">{t("chats.startFromProfile")}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onSelect(room.id)}
          className={`w-full text-start p-4 border-b border-border hover:bg-accent/50 transition-colors ${selectedRoom === room.id ? "bg-accent" : ""}`}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              {room.otherUser?.profilePhoto ? (
                <img src={room.otherUser.profilePhoto} alt="" className="object-cover h-full w-full" />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {room.otherUser?.name?.charAt(0) || "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{room.otherUser?.name || "User"}</p>
              {room.lastMessage && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {room.lastMessage.messageType === "text" ? room.lastMessage.content : `[${room.lastMessage.messageType}]`}
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </ScrollArea>
  );
}

function ChatArea({ roomId, userId, onBack }: { roomId: number; userId: number; onBack: () => void }) {
  const { t } = useLanguage();
  const { data: messages, isLoading } = trpc.chat.messages.useQuery({ roomId }, { refetchInterval: 3000 });
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const sendMutation = trpc.chat.send.useMutation({
    onSuccess: () => { setText(""); utils.chat.messages.invalidate({ roomId }); utils.chat.rooms.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMutation.mutate({ roomId, content: text.trim(), messageType: "text" });
  };

  const sortedMessages = messages ? [...messages].reverse() : [];

  return (
    <>
      <div className="border-b border-border p-3 flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium text-sm">{t("chats.conversation")}</span>
      </div>

      <ScrollArea className="flex-1 p-4" style={{ minHeight: "350px", maxHeight: "400px" }}>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : sortedMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">{t("chats.noMessages")}</div>
        ) : (
          <div className="space-y-3">
            {sortedMessages.map((msg) => {
              const isMine = msg.senderId === userId;
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-4 py-2 ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {msg.messageType === "text" && <p className="text-sm">{msg.content}</p>}
                    {msg.messageType === "image" && <img src={msg.mediaUrl || ""} alt="" className="max-w-full h-auto" />}
                    {msg.messageType === "location" && (
                      <div className="flex items-center gap-1 text-sm"><MapPin className="h-3.5 w-3.5" /> {msg.content}</div>
                    )}
                    <p className={`text-xs mt-1 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-border p-3 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("chats.typeMessage")}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={!text.trim() || sendMutation.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
