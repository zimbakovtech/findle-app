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
      <ActionBarContent bg="white" borderWidth="1px" borderColor="indigo.100" borderRadius="xl" shadow="lg">
        <ActionBarSelectionTrigger>
          {ids.length} selected
        </ActionBarSelectionTrigger>
        <ActionBarSeparator />
        <Button
          size="sm"
          colorPalette="red"
          _hover={{ background: "red.400" }}
          onClick={() => setIsOpenModalAlert(true)}
        >
          Delete
        </Button>
        <Button
          size="sm"
          colorPalette="blue"
          _hover={{ background: "blue.400" }}
          onClick={() => setIDs([])}
        >
          Clear Selection
        </Button>
      </ActionBarContent>
    </ActionBarRoot>
  );
};

export default ActionBarDelete;
