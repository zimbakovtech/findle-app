import {
  ActionBarContent,
  ActionBarRoot,
  ActionBarSelectionTrigger,
  ActionBarSeparator,
} from "@/components/ui/action-bar";
import { Button } from "@/components/ui/button";
import { ActionBarDeleteProps } from "@/pages/dashboard/Types";

const ActionBarDelete = ({
  hasSelection,
  ids,
  setIsOpenModalAlert,
  setIDs,
}: ActionBarDeleteProps) => {
  return (
    <ActionBarRoot open={hasSelection}>
      <ActionBarContent
        bg="white"
        borderWidth="1px"
        borderColor="#E2E8F0"
        borderRadius="10px"
        boxShadow="0 4px 16px rgba(15,23,42,0.1)"
      >
        <ActionBarSelectionTrigger
          fontSize="13px"
          color="#475569"
          fontWeight="500"
        >
          {ids.length} selected
        </ActionBarSelectionTrigger>
        <ActionBarSeparator />
        <Button
          size="sm"
          colorPalette="red"
          borderRadius="7px"
          fontSize="13px"
          fontWeight="600"
          onClick={() => setIsOpenModalAlert(true)}
        >
          Delete
        </Button>
        <Button
          size="sm"
          variant="ghost"
          borderRadius="7px"
          fontSize="13px"
          color="#64748B"
          onClick={() => setIDs([])}
        >
          Clear
        </Button>
      </ActionBarContent>
    </ActionBarRoot>
  );
};

export default ActionBarDelete;
