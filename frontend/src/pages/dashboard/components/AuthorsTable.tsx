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

  const handleAddAuthor = handleSubmit(async (data) => {
    if (isLoading) return;
    setIsLoading(true);
    const response = await createAuthor(data);
    if (response.data && response.success) {
      reset();
      toaster.create({
        title: "Author added to catalog.",
        type: "success",
      });
      fetchAuthors();
    } else {
      if (Array.isArray(response.error)) {
        response.error.forEach((errorMsg: string) => {
          toaster.create({
            title: errorMsg,
            type: "error",
          });
        });
      } else {
        toaster.create({
          title: getErrorDetail(response.error),
          type: "error",
        });
      }
    }
    setIsLoading(false);
  });

  const deleteAuthors = async () => {
    const response = await deleteAuthorsBatch({ ids: authorsIDs });
    if (response.data && response.success) {
      toaster.create({
        title: response.data.message,
        type: "success",
      });
      fetchAuthors();
      setAuthorsIDs([]);
    } else {
      toaster.create({
        title: getErrorDetail(response.error),
        type: "error",
      });
    }
  };

  const handleSearch = async () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchAuthors();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <Flex gap={3} justify="space-between" mb={4} wrap="wrap">
        <InputGroup flex="1" startElement={<LuSearch size={15} color="#6B7280" />}>
          <Input
            borderColor="indigo.100"
            borderWidth={1.5}
            focusRing="inside"
            focusRingColor="indigo.400"
            maxW="400px"
            placeholder="Search authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            borderRadius="lg"
            bg="white"
            fontSize="sm"
          />
        </InputGroup>

        <DialogRoot key="center" placement="center" motionPreset="slide-in-bottom">
          <DialogTrigger asChild>
            <Button
              bg="indigo.600"
              color="white"
              _hover={{ bg: "indigo.700" }}
              borderRadius="lg"
              gap={1}
              fontWeight="500"
              size="sm"
              px={4}
            >
              <LuPlus size={15} />
              Add Author
            </Button>
          </DialogTrigger>
          <DialogContent bg="white" borderRadius="2xl" borderColor="indigo.100" borderWidth={1}>
            <DialogHeader borderBottomWidth="1px" borderColor="indigo.50" pb={3}>
              <DialogTitle color="indigo.900" fontWeight="700">
                Add New Author
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAuthor}>
              <DialogBody pb="4" pt={4}>
                <Stack gap="4">
                  <Field
                    label="Author Name"
                    invalid={!!errors.name}
                    errorText={errors.name?.message}
                  >
                    <Input
                      borderColor="indigo.200"
                      _focus={{ borderColor: "indigo.500" }}
                      borderRadius="lg"
                      {...register("name", {
                        required: "Name is required",
                        maxLength: {
                          value: 200,
                          message: "Name cannot exceed 200 characters",
                        },
                      })}
                    />
                  </Field>
                </Stack>
              </DialogBody>
              <DialogFooter gap={2} borderTopWidth="1px" borderColor="indigo.50">
                <Button
                  variant="ghost"
                  loading={isLoading}
                  onClick={() => reset()}
                  borderRadius="lg"
                >
                  Cancel
                </Button>
                <Button
                  loading={isLoading}
                  type="submit"
                  bg="indigo.600"
                  color="white"
                  _hover={{ bg: "indigo.700" }}
                  borderRadius="lg"
                >
                  Add Author
                </Button>
              </DialogFooter>
            </form>
            <DialogCloseTrigger color="gray.500" _hover={{ bgColor: "indigo.50" }} />
          </DialogContent>
        </DialogRoot>
      </Flex>

      {authors.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={16}
          gap={3}
          bg="white"
          borderRadius="xl"
          border="1px dashed"
          borderColor="indigo.200"
        >
          <Box
            w={12}
            h={12}
            bg="indigo.50"
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="indigo.400"
          >
            <LuUsers size={22} />
          </Box>
          <Text fontWeight="600" color="indigo.700" fontSize="md">
            No authors yet
          </Text>
          <Text fontSize="sm" color="gray.400" textAlign="center" maxW="240px">
            Add your first author before creating books.
          </Text>
        </Flex>
      ) : (
        <Table.Root variant="line" size="sm" bg="white" borderRadius="xl" overflow="hidden">
          <Table.Header>
            <Table.Row bg="indigo.50" borderBottomWidth={2} borderColor="indigo.100">
              <Table.ColumnHeader width="8%" py={3}>
                <Checkbox
                  colorPalette="indigo"
                  size="sm"
                  _hover={{ cursor: "pointer" }}
                  aria-label="Select all rows"
                  checked={indeterminate ? "indeterminate" : authorsIDs.length === authors.length && authors.length > 0}
                  onCheckedChange={(changes) => {
                    setAuthorsIDs(
                      changes.checked ? authors.map((item) => item.id) : []
                    );
                  }}
                />
              </Table.ColumnHeader>
              <Table.ColumnHeader
                textAlign="start"
                color="indigo.700"
                fontWeight="600"
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="0.05em"
                py={3}
              >
                Author
              </Table.ColumnHeader>
              <Table.ColumnHeader
                color="indigo.700"
                fontWeight="600"
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="0.05em"
                py={3}
              >
                ID
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {authors.map((item) => (
              <Table.Row
                borderBottomWidth={1}
                borderColor="indigo.50"
                key={item.id}
                bg={authorsIDs.includes(item.id) ? "indigo.50" : "white"}
                _hover={{ bg: "indigo.50" }}
                cursor="pointer"
                onClick={() =>
                  setAuthorsIDs((prev) =>
                    prev.includes(item.id)
                      ? prev.filter((id) => id !== item.id)
                      : [...prev, item.id]
                  )
                }
              >
                <Table.Cell py={3} onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    colorPalette="indigo"
                    size="sm"
                    variant="solid"
                    _hover={{ cursor: "pointer" }}
                    aria-label="Select row"
                    checked={authorsIDs.includes(item.id)}
                    onCheckedChange={(changes) => {
                      setAuthorsIDs((prev) =>
                        changes.checked
                          ? [...prev, item.id]
                          : prev.filter((id) => id !== item.id)
                      );
                    }}
                  />
                </Table.Cell>
                <Table.Cell textAlign="start" fontWeight="500" color="indigo.900" fontSize="sm" py={3}>
                  {item.name}
                </Table.Cell>
                <Table.Cell color="gray.400" fontSize="xs" fontFamily="monospace" py={3}>
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
