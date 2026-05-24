import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@chakra-ui/react/button";
import { AlertProps } from "@/pages/dashboard/Types";

const AlertModal: React.FC<AlertProps> = ({ open, setOpen, deleteFunction }) => {
  return (
    <DialogRoot
      role="alertdialog"
      lazyMount
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <DialogContent
        bg="white"
        borderRadius="14px"
        border="1px solid #E2E8F0"
        boxShadow="0 8px 32px rgba(15,23,42,0.12)"
      >
        <DialogHeader pb={2}>
          <DialogTitle
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontWeight="800"
            fontSize="16px"
            color="#0F172A"
            letterSpacing="-0.02em"
          >
            Are you sure?
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>
            This action cannot be undone. It will permanently delete the selected
            items from the catalog.
          </p>
        </DialogBody>
        <DialogFooter gap={2}>
          <DialogActionTrigger asChild>
            <Button
              variant="ghost"
              style={{ fontSize: "13px", color: "#64748B" }}
            >
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button
            style={{
              fontSize: "13px",
              fontWeight: 600,
              backgroundColor: "#EF4444",
              color: "#ffffff",
              borderRadius: "8px",
            }}
            onClick={() => deleteFunction()}
          >
            Delete
          </Button>
        </DialogFooter>
        <DialogCloseTrigger style={{ color: "#94A3B8" }} />
      </DialogContent>
    </DialogRoot>
  );
};

export default AlertModal;
