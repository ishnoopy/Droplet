import { useEffect, useEffectEvent, useState } from "react";
import "../../App.css";
import { AlertDialog } from "../../components/AlertDialog";
import { useSocketContext } from "../../providers/socket-context";
import ClientsList from "./ClientsList";
import FileInput from "./FileInput";

function Home() {
  const [files, setFiles] = useState<Array<File>>([]);
  const [isReceiveFilesAlertDialogOpen, setIsReceiveFilesAlertDialogOpen] = useState(false);
  const { socketRef, clients, filesLength, setFilesLength, filesData, setFilesData } = useSocketContext()
  const [recipient, setRecipient] = useState<string | null> (null)

  const showReceiveFilesAlertDialog = useEffectEvent(() => {
    setIsReceiveFilesAlertDialogOpen(true);
  });

  useEffect(() => {
    // Checks if the received files are complete
    if (filesData.length === 0 || filesData.length !== filesLength) {
      return;
    }

    showReceiveFilesAlertDialog();

  }, [filesData, filesLength]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    } else {
      setFiles([]);
    }
  };

  const handleReceiveFilesAlertDialogConfirm = () => {
    setIsReceiveFilesAlertDialogOpen(false);

    if (filesData.length === 0 || filesData.length !== filesLength) return;

    // Trigger download of each file
    filesData.forEach((fileData, index: number) => {
      if (!fileData) return;
      const blob = new Blob([fileData.buffer as ArrayBuffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${Date.now()}-${index+1}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    });

    setFilesData([]);
    setFilesLength(0);
  }

  const handleReceiveFilesAlertDialogCancel = () => {
    setIsReceiveFilesAlertDialogOpen(false);
    setFilesData([]);
  }

  const sendFiles = () => {
    if (!files.length || !socketRef.current) return;

    // Send files length first
    socketRef.current?.send(JSON.stringify({
      type: "files-length",
      value: files.length.toString()
    }));

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Send IP recipient
        socketRef.current?.send(JSON.stringify({
          type: "recipient",
          value: recipient as string
        }));

        // Send file bytes
        socketRef.current?.send(reader.result as ArrayBuffer);
      }
      reader.onerror = () => {
        console.error(`Read failed ${reader.error}`);
      }
      reader.readAsArrayBuffer(file);
    })

    setFiles([]);
  };

  const handleSelectClient = (clientIp: string) => {
    setRecipient(clientIp)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">Droplet 🪣</h1>
            <p className="text-muted-foreground text-sm">Send files seamlessly to connected clients</p>
          </div>

          {/* Main Content Card */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
            <FileInput files={files} preview={true} handleFileChange={handleFileChange} sendFiles={sendFiles} />

            <div className="border-t border-border pt-6">
              <ClientsList clients={clients} handleSelectClient={handleSelectClient} />
            </div>
          </div>

          <AlertDialog
            isOpen={isReceiveFilesAlertDialogOpen}
            setIsOpen={setIsReceiveFilesAlertDialogOpen}
            title="File Received"
            description="File received successfully"
            confirmText="OK"
            cancelText="Cancel"
            onConfirm={handleReceiveFilesAlertDialogConfirm}
            onCancel={handleReceiveFilesAlertDialogCancel} />
        </div>
      </div>
    </div>
  );
}

export default Home;
