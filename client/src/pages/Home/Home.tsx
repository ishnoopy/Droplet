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
    filesData.forEach((fileData) => {
      if (!fileData) return;
      const blob = new Blob([fileData.bytes as unknown as ArrayBuffer], { type: fileData.metadata?.fileType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileData.metadata?.fileName || `file-${Date.now()}`;
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

  const sendFiles = async () => {
    if (!files.length || !socketRef.current) return;

    // Send files length first
    socketRef.current?.send(JSON.stringify({
      type: "files-length",
      value: files.length.toString()
    }));

    // Send recipient once (before all files)
    socketRef.current.send(JSON.stringify({
      type: "recipient",
      value: recipient as string
    }));

    for (const file of files) {
      socketRef.current?.send(JSON.stringify({
        type: "meta-data",
        value: JSON.stringify({
          "fileName": file.name,
          "fileSize": file.size,
          "fileType": file.type
        })
      }));

      const buffer = await file.arrayBuffer();
      socketRef.current?.send(buffer);
    }

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
