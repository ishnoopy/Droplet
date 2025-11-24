import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

type ClientsListProps = {
    clients: Array<string>;
    handleSelectClient: (e: string) => void;
}

export default function ClientsList({ clients, handleSelectClient }: ClientsListProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Recipient
      </label>
      <Select onValueChange={handleSelectClient}>
        <SelectTrigger className="w-full h-11">
          <SelectValue placeholder="Select a client to send files to" />
        </SelectTrigger>
        <SelectContent>
          {clients.length > 0 ? (
            clients.map((clientIp) => (
              <SelectItem key={clientIp} value={clientIp}>
                {clientIp}
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No clients connected
            </div>
          )}
        </SelectContent>
      </Select>
      {clients.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {clients.length} client{clients.length > 1 ? 's' : ''} available
        </p>
      )}
    </div>
  );
}
