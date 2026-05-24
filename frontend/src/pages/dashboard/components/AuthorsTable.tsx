import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { LuSearch, LuPlus, LuUsers } from "react-icons/lu";
import { Flex, Input, Stack, Table, Box, Text } from "@chakra-ui/react";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toaster } from "@/components/ui/toaster";
import { Checkbox } from "@/components/ui/checkbox";

import useAuthorsService from "@/api/authorsApi";
import { getErrorDetail } from "@/dto/ApiResponseDto";
import { PostBodyCreateAuthorDto } from "@/dto/AuthorsDto";
import { AuthorsTableProps } from "@/pages/dashboard/Types";
import AlertModal from "@/pages/dashboard/components/AlertModal";
import ActionBarDelete from "@/pages/dashboard/components/ActionBarDelete";

const BORDER = "#E2E8F0";
const TEXT_PRIMARY = "#0F172A";
const TEXT_MUTED = "#64748B";
const TEXT_FAINT = "#94A3B8";
const BRAND = "#2563EB";
const BRAND_LIGHT = "#EFF6FF";

const AuthorsTable: React.FC<AuthorsTableProps> = ({
  authors,
  searchQuery,
  setCurrentPage,
  currentPage,
  setSearchQuery,
  fetchAuthors,
}) => {
  const { createAuthor, deleteAuthorsBatch } = useAuthorsService();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostBodyCreateAuthorDto>({ mode: "onChange" });
  const [authorsIDs, setAuthorsIDs] = useState<number[]>([]);
  const hasSelection = authorsIDs.length > 0;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const indeterminate = hasSelection && authorsIDs.length < authors.length;
  const [isOpenModalAlert, setIsOpenModalAlert] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddAuthor = handleSubmit(async (data) => {
    if (isLoading) return;
    setIsLoading(true);
    const response = await createAuthor(data);
    if (response.data && response.success) {
      reset();
      setIsDialogOpen(false);
      toaster.create({ title: "Author added to catalog.", type: "success" });
      fetchAuthors();
    } else {
      if (Array.isArray(response.error)) {
        response.error.forEach((msg: string) =>
          toaster.create({ title: msg, type: "error" }),
        );
      } else {
        toaster.create({ title: getErrorDetail(response.error), type: "error" });
      }
    }
    setIsLoading(false);
  });

  const deleteAuthors = async () => {
    const response = await deleteAuthorsBatch({ ids: authorsIDs });
    if (response.data && response.success) {
      toaster.create({ title: response.data.message, type: "success" });
      fetchAuthors();
      setAuthorsIDs([]);
    } else {
      toaster.create({ title: getErrorDetail(response.error), type: "error" });
    }
  };

  const handleSearch = async () => {
    if (currentPage !== 1) setCurrentPage(1);
    else fetchAuthors();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <>
      {/* Toolbar */}
      <Flex gap={3} justify="space-between" mb={4} wrap="wrap">
        <InputGroup
          flex="1"
          startElement={<LuSearch size={14} color={TEXT_FAINT} />}
        >
          <Input
            borderColor={BORDER}
            borderWidth={1}
            maxW="400px"
            placeholder="Search authors…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            borderRadius="9px"
            bg="white"
            fontSize="14px"
            color={TEXT_PRIMARY}
            _placeholder={{ color: TEXT_FAINT }}
            _focus={{ borderColor: BRAND, boxShadow: "0 0 0 3px rgba(37,99,235,0.08)" }}
          />
        </InputGroup>

        <DialogRoot
          placement="center"
          motionPreset="slide-in-bottom"
          open={isDialogOpen}
          onOpenChange={(e) => {
            setIsDialogOpen(e.open);
            if (!e.open) reset();
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => setIsDialogOpen(true)}
              borderRadius="9px"
              gap={1.5}
              fontWeight="600"
              fontSize="13px"
              size="sm"
              px={4}
              style={{ backgroundColor: BRAND, color: "#ffffff" }}
            >
              <LuPlus size={14} />
              Add Author
            </Button>
          </DialogTrigger>
          <DialogContent
            bg="white"
            borderRadius="16px"
            border={`1px solid ${BORDER}`}
            boxShadow="0 8px 32px rgba(15,23,42,0.12)"
          >
            <DialogHeader
              borderBottomWidth="1px"
              borderColor="#F1F5F9"
              pb={4}
              pt={5}
              px={6}
            >
              <DialogTitle
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontWeight="800"
                fontSize="17px"
                color={TEXT_PRIMARY}
                letterSpacing="-0.02em"
              >
                Add New Author
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAuthor}>
              <DialogBody pb={4} pt={5} px={6}>
                <Stack gap={4}>
                  <Field
                    label="Author name"
                    invalid={!!errors.name}
                    errorText={errors.name?.message}
                  >
                    <Input
                      borderColor={BORDER}
                      borderRadius="9px"
                      fontSize="14px"
                      _focus={{ borderColor: BRAND, boxShadow: "0 0 0 3px rgba(37,99,235,0.08)" }}
                      {...register("name", {
                        required: "Name is required",
                        maxLength: { value: 200, message: "Name cannot exceed 200 characters" },
                      })}
                    />
                  </Field>
                </Stack>
              </DialogBody>
              <DialogFooter
                gap={2}
                borderTopWidth="1px"
                borderColor="#F1F5F9"
                px={6}
                pb={5}
              >
                <Button
                  variant="ghost"
                  loading={isLoading}
                  onClick={() => {
                    reset();
                    setIsDialogOpen(false);
                  }}
                  borderRadius="9px"
                  fontSize="13px"
                  color={TEXT_MUTED}
                >
                  Cancel
                </Button>
                <Button
                  loading={isLoading}
                  type="submit"
                  borderRadius="9px"
                  fontSize="13px"
                  fontWeight="600"
                  style={{ backgroundColor: BRAND, color: "#ffffff" }}
                >
                  Add Author
                </Button>
              </DialogFooter>
            </form>
            <DialogCloseTrigger color={TEXT_FAINT} />
          </DialogContent>
        </DialogRoot>
      </Flex>

      {/* Empty state */}
      {authors.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={16}
          gap={3}
          bg="white"
          borderRadius="12px"
          border={`1px dashed ${BORDER}`}
        >
          <Box
            w={11}
            h={11}
            bg={BRAND_LIGHT}
            borderRadius="10px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={BRAND}
          >
            <LuUsers size={20} />
          </Box>
          <Text
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontWeight="700"
            color={TEXT_PRIMARY}
            fontSize="14px"
          >
            No authors yet
          </Text>
          <Text fontSize="13px" color={TEXT_FAINT} textAlign="center" maxW="220px">
            Add your first author before creating books.
          </Text>
        </Flex>
      ) : (
        <Table.Root
          variant="line"
          size="sm"
          bg="white"
          borderRadius="12px"
          overflow="hidden"
          border={`1px solid ${BORDER}`}
        >
          <Table.Header>
            <Table.Row bg="#F8FAFC" borderBottomWidth={1} borderColor={BORDER}>
              <Table.ColumnHeader width="8%" py={3} px={4}>
                <Checkbox
                  colorPalette="blue"
                  size="sm"
                  aria-label="Select all rows"
                  checked={
                    indeterminate
                      ? "indeterminate"
                      : authorsIDs.length === authors.length && authors.length > 0
                  }
                  onCheckedChange={(changes) => {
                    setAuthorsIDs(
                      changes.checked ? authors.map((item) => item.id) : [],
                    );
                  }}
                />
              </Table.ColumnHeader>
              <Table.ColumnHeader
                textAlign="start"
                color={TEXT_MUTED}
                fontWeight="600"
                fontSize="11px"
                textTransform="uppercase"
                letterSpacing="0.06em"
                py={3}
                px={4}
              >
                Author
              </Table.ColumnHeader>
              <Table.ColumnHeader
                color={TEXT_MUTED}
                fontWeight="600"
                fontSize="11px"
                textTransform="uppercase"
                letterSpacing="0.06em"
                py={3}
                px={4}
              >
                ID
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {authors.map((item) => (
              <Table.Row
                borderBottomWidth={1}
                borderColor="#F8FAFC"
                key={item.id}
                bg={authorsIDs.includes(item.id) ? BRAND_LIGHT : "white"}
                _hover={{ bg: "#F8FAFC" }}
                cursor="pointer"
                onClick={() =>
                  setAuthorsIDs((prev) =>
                    prev.includes(item.id)
                      ? prev.filter((id) => id !== item.id)
                      : [...prev, item.id],
                  )
                }
              >
                <Table.Cell py={3} px={4} onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    colorPalette="blue"
                    size="sm"
                    variant="solid"
                    aria-label="Select row"
                    checked={authorsIDs.includes(item.id)}
                    onCheckedChange={(changes) => {
                      setAuthorsIDs((prev) =>
                        changes.checked
                          ? [...prev, item.id]
                          : prev.filter((id) => id !== item.id),
                      );
                    }}
                  />
                </Table.Cell>
                <Table.Cell
                  textAlign="start"
                  fontWeight="500"
                  color={TEXT_PRIMARY}
                  fontSize="13px"
                  py={3}
                  px={4}
                  letterSpacing="-0.01em"
                  textTransform="capitalize"
                >
                  {item.name}
                </Table.Cell>
                <Table.Cell
                  color={TEXT_FAINT}
                  fontSize="12px"
                  fontFamily="monospace"
                  py={3}
                  px={4}
                >
                  #{item.id}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      <ActionBarDelete
        hasSelection={hasSelection}
        setIsOpenModalAlert={setIsOpenModalAlert}
        setIDs={setAuthorsIDs}
        ids={authorsIDs}
      />
      <AlertModal
        open={isOpenModalAlert}
        setOpen={setIsOpenModalAlert}
        deleteFunction={deleteAuthors}
      />
    </>
  );
};

export default AuthorsTable;
