import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialog as AlertDialogComponent,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog";

type AlertDialogProps = {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    confirmText: string;
    cancelText: string;
    children?: React.ReactNode;
}

export function AlertDialog({ title, description, children, onConfirm, onCancel, isOpen, setIsOpen, confirmText, cancelText }: AlertDialogProps) {
    return (
        <AlertDialogComponent open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>{confirmText}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialogComponent>
    )
}
