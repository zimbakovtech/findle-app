import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Text,
  Box,
  Flex,
  Container,
  Center,
  Badge,
} from "@chakra-ui/react";
import { Tabs } from "@chakra-ui/react";
import { LuUsers, LuBookOpen, LuUser } from "react-icons/lu";
import { Toaster, toaster } from "@/components/ui/toaster";

import Header from "@/components/Header";
import { getErrorDetail } from "@/dto/ApiResponseDto";
import AuthorsTable from "@/pages/dashboard/components/AuthorsTable";
import { AuthorResponseDto } from "@/dto/AuthorsDto";
import { BookResponseDto } from "@/dto/BooksDto";
import Pagination from "@/pages/dashboard/components/Pagination";
import BooksTable from "@/pages/dashboard/components/BooksTable";
import { PageProps, TabProps } from "@/pages/dashboard/Types";
import useBooksService from "@/api/booksApi";
import useAuthorsService from "@/api/authorsApi";
import useUsersService from "@/api/usersApi";
import { GetCurrentUserDto } from "@/dto/UsersDto";
import Footer from "@/components/Footer";

const Dashboard: React.FC = () => {
  const { getCurrentUser } = useUsersService();
  const [currentUser, setCurrentUser] = useState<GetCurrentUserDto | null>(null);

  const { getAuthors } = useAuthorsService();
  const [authors, setAuthors] = useState<AuthorResponseDto[]>([]);
  const [authorsTotalResults, setAuthorsTotalResults] = useState<number>(0);
  const [authorsSearchQuery, setAuthorsSearchQuery] = useState("");
  const [authorsCurrentPage, setAuthorsCurrentPage] = useState<number>(1);

  const { getBooks } = useBooksService();
  const [books, setBooks] = useState<BookResponseDto[]>([]);
  const [booksTotalResults, setBooksTotalResults] = useState<number>(0);
  const [booksSearchQuery, setBooksSearchQuery] = useState("");
  const [booksCurrentPage, setBooksCurrentPage] = useState<number>(1);

  const [tab, setTab] = useState<TabProps>({ value: "books" });

  // Use refs to guard concurrent fetches without causing dep-loop
  const authorsLoadingRef = useRef(false);
  const booksLoadingRef = useRef(false);

  const pageSize = 20;

  const authorsPageProps: PageProps = {
    totalResults: authorsTotalResults,
    pageSize,
    currentPage: authorsCurrentPage,
    setCurrentPage: setAuthorsCurrentPage,
  };

  const booksPageProps: PageProps = {
    totalResults: booksTotalResults,
    pageSize,
    currentPage: booksCurrentPage,
    setCurrentPage: setBooksCurrentPage,
  };

  const getCurrentUserInfo = useCallback(async () => {
    const response = await getCurrentUser();
    if (response.data && response.success) {
      setCurrentUser(response.data);
    } else {
      toaster.create({ title: getErrorDetail(response.error), type: "error" });
    }
  }, [getCurrentUser]);

  const fetchAuthors = useCallback(async (): Promise<void> => {
    if (authorsLoadingRef.current) return;
    authorsLoadingRef.current = true;
    const offset = (authorsCurrentPage - 1) * pageSize;
    const response = await getAuthors({
      limit: pageSize,
      offset,
      ...(authorsSearchQuery && { name: authorsSearchQuery }),
    });
    if (response.data && response.success) {
      setAuthors(response.data.authors);
      setAuthorsTotalResults(response.data.total_results);
    } else {
      toaster.create({ title: getErrorDetail(response.error), type: "error" });
      setAuthors([]);
    }
    authorsLoadingRef.current = false;
  }, [authorsCurrentPage, authorsSearchQuery, getAuthors]);

  const fetchBooks = useCallback(async (): Promise<void> => {
    if (booksLoadingRef.current) return;
    booksLoadingRef.current = true;
    const offset = (booksCurrentPage - 1) * pageSize;
    const response = await getBooks({
      limit: pageSize,
      offset,
      ...(booksSearchQuery && { title: booksSearchQuery }),
    });
    if (response.data && response.success) {
      setBooks(response.data.books);
      setBooksTotalResults(response.data.total_results);
    } else {
      toaster.create({ title: getErrorDetail(response.error), type: "error" });
      setBooks([]);
    }
    booksLoadingRef.current = false;
  }, [booksCurrentPage, booksSearchQuery, getBooks]);

  useEffect(() => {
    getCurrentUserInfo();
  }, [getCurrentUserInfo]);

  useEffect(() => {
    fetchAuthors();
  }, [authorsCurrentPage, fetchAuthors]);

  useEffect(() => {
    fetchBooks();
  }, [booksCurrentPage, fetchBooks]);

  const changeTabView = (e: TabProps) => {
    setTab(e);
    if (e.value === "authors") {
      fetchAuthors();
    } else {
      fetchBooks();
    }
  };

  return (
    <>
      <Header />
      <Flex
        direction="column"
        justifyContent="space-between"
        minHeight="calc(100dvh - 56px)"
        style={{ backgroundColor: "#F8FAFC" }}
      >
        <Container maxW="1200px" py={6}>
          {/* User info bar */}
          <Flex
            align="center"
            gap={3}
            mb={6}
            bg="white"
            border="1px solid #E2E8F0"
            borderRadius="12px"
            px={4}
            py={3}
          >
            <Box
              w={8}
              h={8}
              bg="#EFF6FF"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="#2563EB"
              flexShrink={0}
            >
              <LuUser size={15} />
            </Box>
            {currentUser ? (
              <Flex align="center" gap={2} flexWrap="wrap">
                <Text
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontWeight="700"
                  color="#0F172A"
                  fontSize="14px"
                  letterSpacing="-0.01em"
                >
                  {currentUser.username}
                </Text>
                <Text color="#94A3B8" fontSize="13px">
                  {currentUser.email}
                </Text>
                {currentUser.is_superuser && (
                  <Badge
                    bg="#EFF6FF"
                    color="#1D4ED8"
                    fontSize="11px"
                    fontWeight="600"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    letterSpacing="0.02em"
                  >
                    Admin
                  </Badge>
                )}
              </Flex>
            ) : (
              <Text fontSize="13px" color="#94A3B8">
                Loading…
              </Text>
            )}
          </Flex>

          {/* Dashboard header + tabs */}
          <Box>
            <Flex
              align={{ base: "flex-start", sm: "center" }}
              justify="space-between"
              mb={5}
              direction={{ base: "column", sm: "row" }}
              gap={3}
            >
              <Box>
                <Text
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontWeight="800"
                  fontSize="22px"
                  color="#0F172A"
                  letterSpacing="-0.03em"
                  lineHeight="1.2"
                >
                  Dashboard
                </Text>
                <Text fontSize="13px" color="#64748B" mt={0.5}>
                  Manage your book catalog and authors
                </Text>
              </Box>

              <Tabs.Root value={tab.value} onValueChange={(e) => changeTabView(e)}>
                <Tabs.List
                  bg="#F1F5F9"
                  borderRadius="10px"
                  p="3px"
                  border="none"
                  gap={0}
                >
                  <Tabs.Trigger
                    value="books"
                    borderRadius="8px"
                    fontWeight="500"
                    fontSize="13px"
                    color="#64748B"
                    px={4}
                    py={2}
                    gap={1.5}
                    _selected={{
                      color: "#0F172A",
                      bg: "white",
                      fontWeight: "600",
                      boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
                    }}
                  >
                    <LuBookOpen size={13} />
                    Books
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="authors"
                    borderRadius="8px"
                    fontWeight="500"
                    fontSize="13px"
                    color="#64748B"
                    px={4}
                    py={2}
                    gap={1.5}
                    _selected={{
                      color: "#0F172A",
                      bg: "white",
                      fontWeight: "600",
                      boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
                    }}
                  >
                    <LuUsers size={13} />
                    Authors
                  </Tabs.Trigger>
                </Tabs.List>
              </Tabs.Root>
            </Flex>

            {tab.value === "authors" ? (
              <Flex direction="column" gap={4}>
                <AuthorsTable
                  searchQuery={authorsSearchQuery}
                  setSearchQuery={setAuthorsSearchQuery}
                  setCurrentPage={setAuthorsCurrentPage}
                  currentPage={authorsCurrentPage}
                  authors={authors}
                  fetchAuthors={fetchAuthors}
                />
                <Center>
                  <Pagination {...authorsPageProps} />
                </Center>
              </Flex>
            ) : (
              <Flex direction="column" gap={4}>
                <BooksTable
                  searchQuery={booksSearchQuery}
                  setSearchQuery={setBooksSearchQuery}
                  setCurrentPage={setBooksCurrentPage}
                  currentPage={booksCurrentPage}
                  books={books}
                  fetchBooks={fetchBooks}
                />
                <Center>
                  <Pagination {...booksPageProps} />
                </Center>
              </Flex>
            )}
          </Box>
          <Toaster />
        </Container>
        <Footer />
      </Flex>
    </>
  );
};

export default Dashboard;
