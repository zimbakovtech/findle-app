import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LuSearch, LuPlus, LuBookOpen, LuUser, LuCalendar, LuShoppingCart, LuCheck } from "react-icons/lu";
import {
  createListCollection,
  Flex,
  Input,
  ListCollection,
  Stack,
  HStack,
  SimpleGrid,
  Box,
  Text,
  Badge,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup } from "@/components/ui/input-group";
import { toaster } from "@/components/ui/toaster";
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
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  NumberInputField,
  NumberInputRoot,
} from "@/components/ui/number-input";
import { Field } from "@/components/ui/field";

import {
  bookFormSchema,
  BookFormSchema,
  BooksTableProps,
} from "@/pages/dashboard/Types";
import useBooksService from "@/api/booksApi";
import { getErrorDetail } from "@/dto/ApiResponseDto";
import { PostBodyCreateBookDto } from "@/dto/BooksDto";
import { AuthorResponseDto } from "@/dto/AuthorsDto";
import AlertModal from "@/pages/dashboard/components/AlertModal";
import ActionBarDelete from "@/pages/dashboard/components/ActionBarDelete";
import useAuthorsService from "@/api/authorsApi";

const BooksTable: React.FC<BooksTableProps> = ({
  books,
  searchQuery,
  setCurrentPage,
  currentPage,
  setSearchQuery,
  fetchBooks,
}) => {
  const { createBook, deleteBooksBatch } = useBooksService();
  const { getAuthors } = useAuthorsService();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm<BookFormSchema>({
    mode: "onChange",
    resolver: zodResolver(bookFormSchema),
  });
  const [allAuthors, setAllAuthors] = useState<AuthorResponseDto[]>([]);
  const [isOpenModalAlert, setIsOpenModalAlert] = useState(false);
  const [booksIDs, setBooksIDs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [purchasedIDs, setPurchasedIDs] = useState<Set<number>>(new Set());
  const hasSelection = booksIDs.length > 0;
  const indeterminate = hasSelection && booksIDs.length < books.length;

  const handleBuy = (e: React.MouseEvent, bookId: number, title: string, price: number) => {
    e.stopPropagation();
    setPurchasedIDs((prev) => new Set(prev).add(bookId));
    toaster.create({
      title: `"${title}" purchased for $${price.toFixed(2)}!`,
      type: "success",
    });
  };

  useEffect(() => {
    fetchAllAuthors();
  }, []);

  const fetchAllAuthors = async (): Promise<void> => {
    const response = await getAuthors();
    if (response.data && response.success) {
      setAllAuthors(response.data.authors);
    } else {
      toaster.create({
        title: getErrorDetail(response.error),
        type: "error",
      });
      setAllAuthors([]);
    }
  };

  const transformAuthorsToListCollection = (authors: AuthorResponseDto[]) => {
    return createListCollection({
      items: authors.map((author) => ({
        label: author.name,
        value: String(author.id),
      })),
    });
  };

  const authorList: ListCollection<{
    label: string;
    value: string;
  }> = transformAuthorsToListCollection(allAuthors);

  const handleAddBook = handleSubmit(async (formData) => {
    if (isLoading) return;
    setIsLoading(true);
    const price = formData.price ? Number(formData.price) : undefined;
    const data: PostBodyCreateBookDto = {
      title: formData.title,
      year: Number(formData.year),
      author_id: Number(formData.authorList),
      ...(price !== undefined && { price }),
    };

    const response = await createBook(data);
    if (response.data && response.success) {
      reset({ authorList: [], title: "", year: "", price: "" });
      toaster.create({
        title: "New book added to catalog.",
        type: "success",
      });
      fetchBooks();
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

  const deleteBooks = async () => {
    const response = await deleteBooksBatch({ ids: booksIDs });
    if (response.data && response.success) {
      toaster.create({
        title: response.data.message,
        type: "success",
      });
      fetchBooks();
      setBooksIDs([]);
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
      fetchBooks();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      {/* Toolbar */}
      <Flex gap={3} justify="space-between" mb={4} wrap="wrap">
        <InputGroup flex="1" startElement={<LuSearch size={15} color="#6B7280" />}>
          <Input
            borderColor="indigo.100"
            borderWidth={1.5}
            focusRing="inside"
            focusRingColor="indigo.400"
            maxW="400px"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            borderRadius="lg"
            bg="white"
            fontSize="sm"
          />
        </InputGroup>

        <DialogRoot
          key="center"
          placement="center"
          motionPreset="slide-in-bottom"
        >
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
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent bg="white" borderRadius="2xl" borderColor="indigo.100" borderWidth={1}>
            <DialogHeader borderBottomWidth="1px" borderColor="indigo.50" pb={3}>
              <DialogTitle color="indigo.900" fontWeight="700">
                Add New Book
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBook}>
              <DialogBody pb="4" pt={4}>
                <Stack gap="4">
                  <Field
                    label="Book title"
                    invalid={!!errors.title}
                    errorText={errors.title?.message}
                  >
                    <Input
                      borderColor="indigo.200"
                      _focus={{ borderColor: "indigo.500" }}
                      borderRadius="lg"
                      {...register("title", {
                        required: "Title is required",
                        maxLength: {
                          value: 500,
                          message: "Title cannot exceed 500 characters",
                        },
                      })}
                    />
                  </Field>
                  <HStack alignItems="start" gap={4}>
                    <Field
                      flex={1}
                      label="Year"
                      invalid={!!errors.year}
                      errorText={errors.year?.message}
                    >
                      <Controller
                        name="year"
                        control={control}
                        render={({ field }) => (
                          <NumberInputRoot
                            disabled={field.disabled}
                            name={field.name}
                            value={field.value}
                            min={1}
                            max={new Date().getFullYear()}
                            onValueChange={({ value }) => {
                              field.onChange(value);
                            }}
                          >
                            <NumberInputField
                              onBlur={field.onBlur}
                              borderColor="indigo.200"
                              _focus={{ borderColor: "indigo.500" }}
                              borderRadius="lg"
                            />
                          </NumberInputRoot>
                        )}
                      />
                    </Field>
                    <Field
                      flex={1}
                      label="Price (optional)"
                      invalid={!!errors.price}
                      errorText={errors.price?.message}
                    >
                      <Controller
                        name="price"
                        control={control}
                        render={({ field }) => (
                          <NumberInputRoot
                            disabled={field.disabled}
                            name={field.name}
                            value={field.value ?? ""}
                            min={0}
                            formatOptions={{ style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 2 }}
                            onValueChange={({ value }) => {
                              field.onChange(value || "");
                            }}
                          >
                            <NumberInputField
                              onBlur={field.onBlur}
                              placeholder="0.00"
                              borderColor="indigo.200"
                              _focus={{ borderColor: "indigo.500" }}
                              borderRadius="lg"
                            />
                          </NumberInputRoot>
                        )}
                      />
                    </Field>
                  </HStack>
                  <Field
                    label="Author"
                    invalid={!!errors.authorList}
                    errorText={errors.authorList?.message}
                  >
                    <Controller
                      control={control}
                      name="authorList"
                      render={({ field }) => (
                        <SelectRoot
                          name={field.name}
                          value={field.value}
                          onValueChange={({ value }) => {
                            field.onChange(value);
                          }}
                          onInteractOutside={() => field.onBlur()}
                          collection={authorList}
                        >
                          <SelectTrigger
                            clearable
                            borderColor="indigo.200"
                            _focus={{ borderColor: "indigo.500" }}
                            borderRadius="lg"
                          >
                            <SelectValueText placeholder={
                              allAuthors.length === 0
                                ? "No authors — add an author first"
                                : "Select author"
                            } />
                          </SelectTrigger>
                          <SelectContent zIndex="popover" bgColor="white" borderRadius="lg">
                            {authorList.items.map((author) => (
                              <SelectItem
                                item={author}
                                key={author.value}
                                _hover={{
                                  bgColor: "indigo.50",
                                  cursor: "pointer",
                                }}
                                _selected={{
                                  bgColor: "indigo.100",
                                }}
                              >
                                {author.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </SelectRoot>
                      )}
                    />
                  </Field>
                </Stack>
              </DialogBody>
              <DialogFooter gap={2} borderTopWidth="1px" borderColor="indigo.50">
                <Button
                  variant="ghost"
                  loading={isLoading}
                  onClick={() =>
                    reset({ authorList: [], title: "", year: "", price: "" })
                  }
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
                  Add Book
                </Button>
              </DialogFooter>
            </form>
            <DialogCloseTrigger
              color="gray.500"
              _hover={{ bgColor: "indigo.50" }}
            />
          </DialogContent>
        </DialogRoot>
      </Flex>

      {/* Book cards grid */}
      {books.length === 0 ? (
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
            <LuBookOpen size={22} />
          </Box>
          <Text fontWeight="600" color="indigo.700" fontSize="md">
            No books yet
          </Text>
          <Text fontSize="sm" color="gray.400" textAlign="center" maxW="240px">
            Add your first book to start building your catalog.
          </Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
          {books.map((item) => {
            const selected = booksIDs.includes(item.id);
            return (
              <Box
                key={item.id}
                bg={selected ? "indigo.50" : "white"}
                borderRadius="xl"
                border="1.5px solid"
                borderColor={selected ? "indigo.400" : "indigo.100"}
                p={4}
                position="relative"
                cursor="pointer"
                _hover={{
                  borderColor: "indigo.300",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.1)",
                }}
                transition="all 180ms ease"
                onClick={() =>
                  setBooksIDs((prev) =>
                    selected
                      ? prev.filter((id) => id !== item.id)
                      : [...prev, item.id]
                  )
                }
              >
                {/* Checkbox top-right */}
                <Box
                  position="absolute"
                  top={3}
                  right={3}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    size="sm"
                    colorPalette="indigo"
                    checked={selected}
                    onCheckedChange={(changes) => {
                      setBooksIDs((prev) =>
                        changes.checked
                          ? [...prev, item.id]
                          : prev.filter((id) => id !== item.id)
                      );
                    }}
                    aria-label={`Select ${item.title}`}
                  />
                </Box>

                {/* Book icon */}
                <Box
                  w={10}
                  h={10}
                  bg="indigo.100"
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="indigo.600"
                  mb={3}
                >
                  <LuBookOpen size={18} />
                </Box>

                {/* Title */}
                <Text
                  fontWeight="600"
                  fontSize="sm"
                  color="indigo.900"
                  mb={1}
                  lineClamp={2}
                  pr={6}
                  lineHeight="1.4"
                  textTransform="capitalize"
                >
                  {item.title}
                </Text>

                {/* Meta */}
                <Flex direction="column" gap={1} mt={2}>
                  <Flex align="center" gap={1.5}>
                    <LuUser size={11} color="#6B7280" />
                    <Text fontSize="xs" color="gray.500">
                      {item.author}
                    </Text>
                  </Flex>
                  <Flex align="center" gap={1.5}>
                    <LuCalendar size={11} color="#6B7280" />
                    <Text fontSize="xs" color="gray.500">
                      {item.year}
                    </Text>
                  </Flex>
                </Flex>

                {/* Price + Buy */}
                <Flex align="center" justify="space-between" mt={3} gap={2}>
                  {item.price != null ? (
                    <Text fontWeight="700" fontSize="sm" style={{ color: "#4F46E5" }}>
                      ${item.price.toFixed(2)}
                    </Text>
                  ) : (
                    <Badge
                      bg="gray.100"
                      color="gray.400"
                      borderRadius="full"
                      px={2.5}
                      py={0.5}
                      fontSize="xs"
                    >
                      Free
                    </Badge>
                  )}
                  {item.price != null && (
                    purchasedIDs.has(item.id) ? (
                      <Flex
                        align="center"
                        gap={1}
                        px={2.5}
                        py={1}
                        borderRadius="lg"
                        style={{ backgroundColor: "#D1FAE5", color: "#065F46", fontSize: "12px", fontWeight: 600 }}
                      >
                        <LuCheck size={11} />
                        Bought
                      </Flex>
                    ) : (
                      <button
                        onClick={(e) => handleBuy(e, item.id, item.title, item.price!)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#ffffff",
                          backgroundColor: "#4F46E5",
                          border: "none",
                          cursor: "pointer",
                          transition: "background 150ms ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4338CA")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4F46E5")}
                      >
                        <LuShoppingCart size={11} />
                        Buy
                      </button>
                    )
                  )}
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>
      )}

      {/* Select all bar when books exist */}
      {books.length > 0 && (
        <Flex align="center" gap={2} mt={3}>
          <Checkbox
            size="sm"
            colorPalette="indigo"
            checked={indeterminate ? "indeterminate" : booksIDs.length === books.length && books.length > 0}
            onCheckedChange={(changes) => {
              setBooksIDs(changes.checked ? books.map((b) => b.id) : []);
            }}
            aria-label="Select all books"
          />
          <Text fontSize="xs" color="gray.500">
            {booksIDs.length > 0
              ? `${booksIDs.length} of ${books.length} selected`
              : `Select all ${books.length} books`}
          </Text>
        </Flex>
      )}

      <ActionBarDelete
        hasSelection={hasSelection}
        setIsOpenModalAlert={setIsOpenModalAlert}
        setIDs={setBooksIDs}
        ids={booksIDs}
      />
      <AlertModal
        open={isOpenModalAlert}
        setOpen={setIsOpenModalAlert}
        deleteFunction={deleteBooks}
      />
    </>
  );
};

export default BooksTable;
