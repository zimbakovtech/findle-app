import React, { useEffect, useState } from "react";
import { Text, Box, Flex, Container, Center, Badge } from "@chakra-ui/react";
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
  const [currentUser, setCurrentUser] = useState<GetCurrentUserDto | null>();

  const { getAuthors } = useAuthorsService();
  const [authors, setAuthors] = useState<AuthorResponseDto[]>([]);
  const [authorsTotalResults, setAuthorsTotalResults] = useState<number>(1);
  const [authorsSearchQuery, setAuthorsSearchQuery] = useState("");
  const [authorsCurrentPage, setAuthorsCurrentPage] = useState<number>(1);

  const { getBooks } = useBooksService();
  const [books, setBooks] = useState<BookResponseDto[]>([]);
  const [booksTotalResults, setBooksTotalResults] = useState<number>(1);
  const [booksSearchQuery, setBooksSearchQuery] = useState("");
  const [booksCurrentPage, setBooksCurrentPage] = useState<number>(1);

  const [tab, setTab] = useState<TabProps>({ value: "books" });
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 20;

  const authorsPageProps: PageProps = {
    totalResults: authorsTotalResults,
    pageSize: pageSize,
    currentPage: authorsCurrentPage,
    setCurrentPage: setAuthorsCurrentPage,
  };

  const booksPageProps: PageProps = {
    totalResults: booksTotalResults,
    pageSize: pageSize,
    currentPage: booksCurrentPage,
    setCurrentPage: setBooksCurrentPage,
  };

  useEffect(() => {
    getCurrentUserInfo();
  }, []);

  useEffect(() => {
    fetchAuthors();
  }, [authorsCurrentPage]);

  useEffect(() => {
    fetchBooks();
  }, [booksCurrentPage]);

  const getCurrentUserInfo = async () => {
    const response = await getCurrentUser();
    if (response.data && response.success) {
      setCurrentUser(response.data);
    } else {
      toaster.create({
        title: getErrorDetail(response.error),
        type: "error",
      });
    }
  };

  const fetchAuthors = async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    const offset = (authorsCurrentPage - 1) * pageSize;

    const response = await getAuthors({
      limit: pageSize,
      offset: offset,
      ...(authorsSearchQuery && { name: authorsSearchQuery }),
    });
    if (response.data && response.success) {
      setAuthors(response.data.authors);
      setAuthorsTotalResults(response.data.total_results);
    } else {
      toaster.create({
        title: getErrorDetail(response.error),
        type: "error",
      });
      setAuthors([]);
    }
    setIsLoading(false);
  };

  const fetchBooks = async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    const offset = (booksCurrentPage - 1) * pageSize;

    const response = await getBooks({
      limit: pageSize,
      offset: offset,
      ...(booksSearchQuery && { title: booksSearchQuery }),
    });
    if (response.data && response.success) {
      setBooks(response.data.books);
      setBooksTotalResults(response.data.total_results);
    } else {
      toaster.create({
        title: getErrorDetail(response.error),
        type: "error",
      });
      setBooks([]);
    }
    setIsLoading(false);
  };

  const changeTabView = (e: TabProps) => {
    setTab(e);
    e.value === "authors" ? fetchAuthors() : fetchBooks();
  };

  return (
    <>
      <Header />
      <Flex direction="column" justifyContent="space-between" minHeight="calc(100dvh - 60px)">
        <Container maxW="1200px" py={6}>
          {/* User info bar */}
          <Flex
            align="center"
            gap={3}
            mb={6}
            bg="white"
            border="1px solid"
            borderColor="indigo.100"
            borderRadius="xl"
            px={4}
            py={3}
          >
            <Box
              w={9}
              h={9}
              bg="indigo.100"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="indigo.600"
              flexShrink={0}
            >
              <LuUser size={16} />
            </Box>
            {currentUser ? (
              <Flex align="center" gap={2} flexWrap="wrap">
                <Text fontWeight="600" color="indigo.900" fontSize="sm">
                  {currentUser.username}
                </Text>
                <Text color="gray.400" fontSize="xs">
                  {currentUser.email}
                </Text>
                {currentUser.is_superuser && (
                  <Badge
                    bg="indigo.100"
                    color="indigo.700"
                    fontSize="xs"
                    borderRadius="full"
                    px={2}
                  >
                    Admin
                  </Badge>
                )}
              </Flex>
            ) : (
              <Text fontSize="sm" color="gray.400">
                Loading...
              </Text>
            )}
          </Flex>

          {/* Dashboard header + tabs */}
          <Box>
            <Flex
              align={{ base: "flex-start", sm: "center" }}
              justify="space-between"
              mb={6}
              direction={{ base: "column", sm: "row" }}
              gap={3}
            >
              <Box>
                <Text
                  fontWeight="800"
                  fontSize="2xl"
                  color="indigo.900"
                  letterSpacing="-0.02em"
                >
                  Dashboard
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Manage your book catalog and authors
                </Text>
              </Box>

              <Tabs.Root
                value={tab.value}
                onValueChange={(e) => changeTabView(e)}
              >
                <Tabs.List
                  bg="indigo.50"
                  borderRadius="xl"
                  p={1}
                  border="none"
                >
                  <Tabs.Trigger
                    value="books"
                    borderRadius="lg"
                    fontWeight="500"
                    color="gray.500"
                    _selected={{
                      color: "indigo.700",
                      bg: "white",
                      fontWeight: "600",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                    px={4}
                    py={2}
                  >
                    <LuBookOpen size={14} />
                    Books
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="authors"
                    borderRadius="lg"
                    fontWeight="500"
                    color="gray.500"
                    _selected={{
                      color: "indigo.700",
                      bg: "white",
                      fontWeight: "600",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                    px={4}
                    py={2}
                  >
                    <LuUsers size={14} />
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
