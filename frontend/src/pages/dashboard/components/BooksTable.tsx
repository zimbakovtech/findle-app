import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  LuSearch,
  LuPlus,
  LuBookOpen,
  LuUser,
  LuCalendar,
  LuShoppingCart,
  LuCheck,
} from "react-icons/lu";
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
import { NumberInputField, NumberInputRoot } from "@/components/ui/number-input";
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

const BORDER = "#E2E8F0";
const TEXT_PRIMARY = "#0F172A";
const TEXT_MUTED = "#64748B";
const TEXT_FAINT = "#94A3B8";
const BRAND = "#2563EB";
const BRAND_LIGHT = "#EFF6FF";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [booksIDs, setBooksIDs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [purchasedIDs, setPurchasedIDs] = useState<Set<number>>(new Set());
  const hasSelection = booksIDs.length > 0;
  const indeterminate = hasSelection && booksIDs.length < books.length;

  const handleBuy = (
    e: React.MouseEvent,
    bookId: number,
    title: string,
    price: number,
  ) => {
    e.stopPropagation();
    setPurchasedIDs((prev) => new Set(prev).add(bookId));
    toaster.create({
      title: `"${title}" purchased for $${price.toFixed(2)}!`,
      type: "success",
    });
  };

  const fetchAllAuthors = useCallback(async (): Promise<void> => {
    const response = await getAuthors();
    if (response.data && response.success) {
      setAllAuthors(response.data.authors);
    } else {
      toaster.create({ title: getErrorDetail(response.error), type: "error" });
      setAllAuthors([]);
    }
  }, [getAuthors]);

  useEffect(() => {
    fetchAllAuthors();
  }, [fetchAllAuthors]);

  const authorList: ListCollection<{ label: string; value: string }> =
    createListCollection({
      items: allAuthors.map((a) => ({ label: a.name, value: String(a.id) })),
    });

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
      setIsDialogOpen(false);
      toaster.create({ title: "Book added to catalog.", type: "success" });
      fetchBooks();
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

  const deleteBooks = async () => {
    const response = await deleteBooksBatch({ ids: booksIDs });
    if (response.data && response.success) {
      toaster.create({ title: response.data.message, type: "success" });
      fetchBooks();
      setBooksIDs([]);
    } else {
      toaster.create({ title: getErrorDetail(response.error), type: "error" });
    }
  };

  const handleSearch = async () => {
    if (currentPage !== 1) setCurrentPage(1);
    else fetchBooks();
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
            placeholder="Search books…"
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
            if (!e.open) reset({ authorList: [], title: "", year: "", price: "" });
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
              Add Book
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
                Add New Book
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBook}>
              <DialogBody pb={4} pt={5} px={6}>
                <Stack gap={4}>
                  <Field
                    label="Book title"
                    invalid={!!errors.title}
                    errorText={errors.title?.message}
                  >
                    <Input
                      borderColor={BORDER}
                      borderRadius="9px"
                      fontSize="14px"
                      _focus={{ borderColor: BRAND, boxShadow: "0 0 0 3px rgba(37,99,235,0.08)" }}
                      {...register("title", {
                        required: "Title is required",
                        maxLength: { value: 500, message: "Title cannot exceed 500 characters" },
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
                            onValueChange={({ value }) => field.onChange(value)}
                          >
                            <NumberInputField
                              onBlur={field.onBlur}
                              borderColor={BORDER}
                              borderRadius="9px"
                              fontSize="14px"
                              _focus={{ borderColor: BRAND, boxShadow: "0 0 0 3px rgba(37,99,235,0.08)" }}
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
                            onValueChange={({ value }) => field.onChange(value || "")}
                          >
                            <NumberInputField
                              onBlur={field.onBlur}
                              placeholder="0.00"
                              borderColor={BORDER}
                              borderRadius="9px"
                              fontSize="14px"
                              _focus={{ borderColor: BRAND, boxShadow: "0 0 0 3px rgba(37,99,235,0.08)" }}
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
                          onValueChange={({ value }) => field.onChange(value)}
                          onInteractOutside={() => field.onBlur()}
                          collection={authorList}
                        >
                          <SelectTrigger
                            clearable
                            borderColor={BORDER}
                            borderRadius="9px"
                            fontSize="14px"
                            _focus={{ borderColor: BRAND }}
                          >
                            <SelectValueText
                              placeholder={
                                allAuthors.length === 0
                                  ? "No authors — add an author first"
                                  : "Select author"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent
                            zIndex="popover"
                            bgColor="white"
                            borderRadius="10px"
                            border={`1px solid ${BORDER}`}
                            boxShadow="0 4px 16px rgba(15,23,42,0.1)"
                          >
                            {authorList.items.map((author) => (
                              <SelectItem
                                item={author}
                                key={author.value}
                                fontSize="14px"
                                _hover={{ bgColor: BRAND_LIGHT, cursor: "pointer" }}
                                _selected={{ bgColor: "#DBEAFE" }}
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
                    reset({ authorList: [], title: "", year: "", price: "" });
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
                  Add Book
                </Button>
              </DialogFooter>
            </form>
            <DialogCloseTrigger color={TEXT_FAINT} />
          </DialogContent>
        </DialogRoot>
      </Flex>

      {/* Empty state */}
      {books.length === 0 ? (
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
            <LuBookOpen size={20} />
          </Box>
          <Text
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontWeight="700"
            color={TEXT_PRIMARY}
            fontSize="14px"
          >
            No books yet
          </Text>
          <Text fontSize="13px" color={TEXT_FAINT} textAlign="center" maxW="220px">
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
                bg={selected ? BRAND_LIGHT : "white"}
                borderRadius="12px"
                border="1.5px solid"
                borderColor={selected ? "#93C5FD" : BORDER}
                p={4}
                position="relative"
                cursor="pointer"
                _hover={{
                  borderColor: selected ? "#60A5FA" : "#CBD5E1",
                  boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
                }}
                transition="all 180ms ease"
                onClick={() =>
                  setBooksIDs((prev) =>
                    selected
                      ? prev.filter((id) => id !== item.id)
                      : [...prev, item.id],
                  )
                }
              >
                {/* Checkbox */}
                <Box
                  position="absolute"
                  top={3}
                  right={3}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    size="sm"
                    colorPalette="blue"
                    checked={selected}
                    onCheckedChange={(changes) => {
                      setBooksIDs((prev) =>
                        changes.checked
                          ? [...prev, item.id]
                          : prev.filter((id) => id !== item.id),
                      );
                    }}
                    aria-label={`Select ${item.title}`}
                  />
                </Box>

                {/* Book icon */}
                <Box
                  w={9}
                  h={9}
                  bg={BRAND_LIGHT}
                  borderRadius="8px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color={BRAND}
                  mb={3}
                >
                  <LuBookOpen size={16} />
                </Box>

                {/* Title */}
                <Text
                  fontWeight="600"
                  fontSize="13px"
                  color={TEXT_PRIMARY}
                  mb={1}
                  lineClamp={2}
                  pr={6}
                  lineHeight="1.4"
                  textTransform="capitalize"
                  letterSpacing="-0.01em"
                >
                  {item.title}
                </Text>

                {/* Meta */}
                <Flex direction="column" gap={1} mt={2}>
                  <Flex align="center" gap={1.5}>
                    <LuUser size={11} color={TEXT_FAINT} />
                    <Text fontSize="12px" color={TEXT_MUTED}>
                      {item.author}
                    </Text>
                  </Flex>
                  <Flex align="center" gap={1.5}>
                    <LuCalendar size={11} color={TEXT_FAINT} />
                    <Text fontSize="12px" color={TEXT_MUTED}>
                      {item.year}
                    </Text>
                  </Flex>
                </Flex>

                {/* Price + Buy */}
                <Flex align="center" justify="space-between" mt={3} gap={2}>
                  {item.price != null ? (
                    <Text
                      fontWeight="700"
                      fontSize="13px"
                      color={BRAND}
                      letterSpacing="-0.01em"
                    >
                      ${item.price.toFixed(2)}
                    </Text>
                  ) : (
                    <Badge
                      bg="#F1F5F9"
                      color={TEXT_FAINT}
                      borderRadius="full"
                      px={2.5}
                      py={0.5}
                      fontSize="11px"
                      fontWeight="500"
                    >
                      Free
                    </Badge>
                  )}
                  {item.price != null &&
                    (purchasedIDs.has(item.id) ? (
                      <Flex
                        align="center"
                        gap={1}
                        px={2}
                        py={1}
                        borderRadius="7px"
                        style={{
                          backgroundColor: "#D1FAE5",
                          color: "#065F46",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        <LuCheck size={11} />
                        Bought
                      </Flex>
                    ) : (
                      <button
                        onClick={(e) =>
                          handleBuy(e, item.id, item.title, item.price!)
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 10px",
                          borderRadius: "7px",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#ffffff",
                          backgroundColor: BRAND,
                          border: "none",
                          cursor: "pointer",
                          transition: "background 150ms ease",
                          fontFamily: "'Inter', sans-serif",
                          letterSpacing: "-0.01em",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#1D4ED8")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = BRAND)
                        }
                      >
                        <LuShoppingCart size={11} />
                        Buy
                      </button>
                    ))}
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>
      )}

      {/* Select-all bar */}
      {books.length > 0 && (
        <Flex align="center" gap={2} mt={3}>
          <Checkbox
            size="sm"
            colorPalette="blue"
            checked={
              indeterminate
                ? "indeterminate"
                : booksIDs.length === books.length && books.length > 0
            }
            onCheckedChange={(changes) => {
              setBooksIDs(changes.checked ? books.map((b) => b.id) : []);
            }}
            aria-label="Select all books"
          />
          <Text fontSize="12px" color={TEXT_FAINT}>
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
