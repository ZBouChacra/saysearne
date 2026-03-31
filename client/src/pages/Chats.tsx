import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageSquare, Send, Loader2, ArrowLeft, Image, MapPin, Video, Paperclip } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useSearch } from "wouter";

export default function Chats() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const searchString = useSearch();
  const initialRoom = useMemo(() => {
    const params = new URLSearchParams(searchString);
    const r = params.get('room');
    return r ? Number(r) : null;
  }, []);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(initialRoom);

  if (loading) return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-10 border-b border-border/30">
        <div className="container">
          <div className="flex items-center gap-4 animate-slide-up">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#4A9B82] to-[#2D6D5F] flex items-center justify-center shadow-lg shadow-primary/20">
              <MessageSquare className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold">{t("chats.title")}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{t("chats.selectChat")}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 flex-1">
        <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm" style={{ minHeight: "520px" }}>
          <div className="flex h-full" style={{ minHeight: "520px" }}>
            <div className={`w-full md:w-80 border-e border-border/40 ${selectedRoom ? "hidden md:block" : ""}`}>
              <RoomList userId={user.id} selectedRoom={selectedRoom} onSelect={setSelectedRoom} />
            </div>
            <div className={`flex-1 ${!selectedRoom ? "hidden md:flex" : "flex"} flex-col`}>
              {selectedRoom ? (
                <ChatArea roomId={selectedRoom} userId={user.id} onBack={() => setSelectedRoom(null)} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">{t("chats.selectChat")}</p>
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

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!rooms || rooms.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p className="text-sm">{t("chats.noChats")}</p>
        <p className="text-xs mt-1">{t("chats.startFromProfile")}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      {rooms.map((room: any) => (
        <button key={room.id} onClick={() => onSelect(room.id)} className={`w-full text-start p-4 border-b border-border/30 hover:bg-primary/5 transition-all ${selectedRoom === room.id ? "bg-primary/10 border-s-2 border-s-primary" : ""}`}>
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 shrink-0 ring-2 ring-border/30">
              {room.otherUser?.profilePhoto ? (
                <img src={room.otherUser.profilePhoto} alt="" className="object-cover h-full w-full" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-[#4A9B82]/20 to-[#2D6D5F]/20 text-primary font-bold">{room.otherUser?.name?.charAt(0) || "?"}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{room.otherUser?.name || "User"}</p>
              {room.lastMessage && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {room.lastMessage.messageType === "text" ? room.lastMessage.content :
                   room.lastMessage.messageType === "image" ? "📷 Image" :
                   room.lastMessage.messageType === "video" ? "🎥 Video" :
                   room.lastMessage.messageType === "location" ? "📍 Location" :
                   `[${room.lastMessage.messageType}]`}
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
  const [showAttach, setShowAttach] = useState(false);
  const [locationDialog, setLocationDialog] = useState(false);
  const [locationText, setLocationText] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const sendMutation = trpc.chat.send.useMutation({
    onSuccess: () => { setText(""); utils.chat.messages.invalidate({ roomId }); utils.chat.rooms.invalidate(); },
    onError: (err: any) => toast.error(err.message),
  });

  const uploadMutation = trpc.chat.uploadMedia.useMutation({
    onSuccess: (data: any) => {
      sendMutation.mutate({ roomId, content: data.fileName || "media", messageType: data.type, mediaUrl: data.url });
    },
    onError: (err: any) => toast.error(err.message),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMutation.mutate({ roomId, content: text.trim(), messageType: "text" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = type === "image" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) { toast.error(t("chats.fileTooLarge")); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({ roomId, fileName: file.name, fileData: base64, fileType: file.type, type });
    };
    reader.readAsDataURL(file);
    setShowAttach(false);
  };

  const handleSendLocation = () => {
    if (!locationText.trim()) return;
    const content = locationUrl ? `${locationText} | ${locationUrl}` : locationText;
    sendMutation.mutate({ roomId, content, messageType: "location" });
    setLocationDialog(false);
    setLocationText("");
    setLocationUrl("");
  };

  const handleShareCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          sendMutation.mutate({ roomId, content: `📍 ${latitude.toFixed(6)}, ${longitude.toFixed(6)} | ${mapsUrl}`, messageType: "location" });
          setLocationDialog(false);
        },
        () => toast.error(t("chats.locationDenied"))
      );
    } else {
      toast.error(t("chats.locationNotSupported"));
    }
  };

  const sortedMessages = messages ? [...messages].reverse() : [];

  return (
    <>
      <div className="border-b border-border/40 p-4 flex items-center gap-3 bg-muted/20">
        <Button variant="ghost" size="icon" className="md:hidden rounded-lg" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#4A9B82] to-[#2D6D5F] flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
        <span className="font-serif font-bold text-sm">{t("chats.conversation")}</span>
      </div>

      <ScrollArea className="flex-1 p-5" style={{ minHeight: "350px", maxHeight: "400px" }}>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : sortedMessages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">{t("chats.noMessages")}</div>
        ) : (
          <div className="space-y-3">
            {sortedMessages.map((msg: any) => {
              const isMine = msg.senderId === userId;
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${isMine ? "bg-gradient-to-r from-[#4A9B82] to-[#2D6D5F] text-white rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                    {msg.messageType === "text" && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                    {msg.messageType === "image" && (
                      <div>
                        <img src={msg.mediaUrl || ""} alt="" className="max-w-full max-h-60 object-contain rounded-lg cursor-pointer" onClick={() => window.open(msg.mediaUrl, "_blank")} />
                        {msg.content && msg.content !== "media" && <p className="text-xs mt-1.5">{msg.content}</p>}
                      </div>
                    )}
                    {msg.messageType === "video" && (
                      <div>
                        <video src={msg.mediaUrl || ""} controls className="max-w-full max-h-60 rounded-lg" />
                        {msg.content && msg.content !== "media" && <p className="text-xs mt-1.5">{msg.content}</p>}
                      </div>
                    )}
                    {msg.messageType === "location" && (
                      <div className="text-sm">
                        <div className="flex items-center gap-1.5 mb-1"><MapPin className="h-4 w-4" /> {t("chats.location")}</div>
                        {msg.content?.includes("|") ? (
                          <>
                            <p className="text-xs">{msg.content.split("|")[0].trim()}</p>
                            <a href={msg.content.split("|")[1].trim()} target="_blank" rel="noopener noreferrer" className="text-xs underline">{t("chats.viewOnMap")}</a>
                          </>
                        ) : (
                          <p className="text-xs">{msg.content}</p>
                        )}
                      </div>
                    )}
                    <p className={`text-[10px] mt-1.5 ${isMine ? "text-white/60" : "text-muted-foreground"}`}>
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

      <div className="border-t border-border/40 p-4 bg-muted/10">
        <div className="flex gap-2.5">
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setShowAttach(!showAttach)} className="shrink-0 rounded-lg hover:bg-primary/10">
              <Paperclip className="h-4 w-4" />
            </Button>
            {showAttach && (
              <div className="absolute bottom-full mb-2 start-0 bg-popover border border-border/60 shadow-xl rounded-xl p-2 space-y-1 z-10 min-w-[160px]">
                <button className="flex items-center gap-2.5 w-full text-start px-3 py-2.5 text-sm hover:bg-primary/5 rounded-lg transition-colors" onClick={() => fileInputRef.current?.click()}>
                  <Image className="h-4 w-4 text-primary" /> {t("chats.sendImage")}
                </button>
                <button className="flex items-center gap-2.5 w-full text-start px-3 py-2.5 text-sm hover:bg-primary/5 rounded-lg transition-colors" onClick={() => videoInputRef.current?.click()}>
                  <Video className="h-4 w-4 text-primary" /> {t("chats.sendVideo")}
                </button>
                <button className="flex items-center gap-2.5 w-full text-start px-3 py-2.5 text-sm hover:bg-primary/5 rounded-lg transition-colors" onClick={() => { setLocationDialog(true); setShowAttach(false); }}>
                  <MapPin className="h-4 w-4 text-primary" /> {t("chats.sendLocation")}
                </button>
              </div>
            )}
          </div>

          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("chats.typeMessage")} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} className="flex-1 rounded-full h-11" />
          <Button size="icon" onClick={handleSend} disabled={!text.trim() || sendMutation.isPending} className="rounded-full h-11 w-11 bg-gradient-to-r from-[#4A9B82] to-[#2D6D5F] hover:opacity-90 shadow-md shadow-primary/20">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "image")} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, "video")} />

        {uploadMutation.isPending && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> {t("chats.uploading")}
          </div>
        )}
      </div>

      {/* Location Dialog */}
      <Dialog open={locationDialog} onOpenChange={setLocationDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif text-xl">{t("chats.shareLocation")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" className="w-full gap-2.5 rounded-full h-11 hover:bg-primary/5 hover:border-primary/40" onClick={handleShareCurrentLocation}>
              <MapPin className="h-4 w-4 text-primary" /> {t("chats.shareCurrentLocation")}
            </Button>
            <div className="text-center text-sm text-muted-foreground">{t("chats.or")}</div>
            <div>
              <Label className="text-sm font-semibold">{t("chats.locationDescription")}</Label>
              <Input value={locationText} onChange={(e) => setLocationText(e.target.value)} className="mt-1.5 rounded-lg" placeholder={t("chats.locationPlaceholder")} />
            </div>
            <div>
              <Label className="text-sm font-semibold">{t("chats.googleMapsLink")} ({t("chats.optional")})</Label>
              <Input value={locationUrl} onChange={(e) => setLocationUrl(e.target.value)} className="mt-1.5 rounded-lg" placeholder="https://maps.google.com/..." />
            </div>
            <Button onClick={handleSendLocation} disabled={!locationText.trim()} size="lg" className="w-full rounded-full bg-gradient-to-r from-[#4A9B82] to-[#2D6D5F] hover:opacity-90">{t("chats.send")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
