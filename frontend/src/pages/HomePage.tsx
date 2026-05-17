import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  Text,
  Button,
  Link,
  SimpleGrid,
} from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  LuBookOpen,
  LuUsers,
  LuSearch,
  LuArrowRight,
  LuShoppingCart,
  LuStar,
} from "react-icons/lu";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => (
  <Box
    bg="white"
    borderRadius="xl"
    p={6}
    boxShadow="0 1px 3px rgba(0,0,0,0.08)"
    border="1px solid"
    borderColor="indigo.100"
    _hover={{
      boxShadow: "0 4px 16px rgba(99,102,241,0.12)",
      borderColor: "indigo.300",
      transform: "translateY(-2px)",
    }}
    transition="all 200ms ease"
  >
    <Box
      w={10}
      h={10}
      bg="indigo.50"
      borderRadius="lg"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="indigo.600"
      mb={4}
    >
      {icon}
    </Box>
    <Text fontWeight="600" fontSize="md" color="indigo.900" mb={2}>
      {title}
    </Text>
    <Text fontSize="sm" color="gray.500" lineHeight="1.6">
      {description}
    </Text>
  </Box>
);

const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    if (location.state?.message) {
      toaster.create({
        title: location.state.message.title,
        type: location.state.message.type,
      });
    }
    navigate(location.pathname, { replace: true });
  }, [location.state, location.pathname, navigate]);

  return (
    <>
      <Header />
      <Flex direction="column" minHeight="calc(100dvh - 60px)">
        {/* Hero */}
        <Box
          bg="linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%)"
          py={{ base: 16, sm: 24 }}
          px={4}
        >
          <Container maxW="900px" textAlign="center">
            <Flex
              align="center"
              justify="center"
              gap={3}
              mb={5}
            >
              <Box
                bg="whiteAlpha.200"
                borderRadius="xl"
                p={3}
              >
                <LuBookOpen size={32} color="white" />
              </Box>
            </Flex>
            <Text
              fontSize={{ base: "4xl", sm: "6xl" }}
              fontWeight="800"
              color="white"
              letterSpacing="-0.03em"
              lineHeight="1.1"
              mb={4}
            >
              Findle
            </Text>
            <Text
              fontSize={{ base: "lg", sm: "xl" }}
              color="indigo.100"
              mb={8}
              maxW="520px"
              mx="auto"
              lineHeight="1.6"
            >
              Your digital book catalog — discover, organize, and track your
              reading collection at FINKI.
            </Text>
            <Flex
              gap={3}
              justify="center"
              direction={{ base: "column", sm: "row" }}
            >
              {isAuthenticated ? (
                <Button
                  asChild
                  size="lg"
                  bg="white"
                  color="indigo.700"
                  fontWeight="700"
                  _hover={{ bg: "indigo.50" }}
                  borderRadius="xl"
                  px={8}
                >
                  <Link href="/dashboard" style={{ textDecoration: "none" }}>
                    Go to Dashboard
                    <LuArrowRight size={16} style={{ marginLeft: 8 }} />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    bg="white"
                    color="indigo.700"
                    fontWeight="700"
                    _hover={{ bg: "indigo.50" }}
                    borderRadius="xl"
                    px={8}
                  >
                    <Link href="/signup" style={{ textDecoration: "none" }}>
                      Get Started Free
                      <LuArrowRight size={16} style={{ marginLeft: 8 }} />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    color="white"
                    borderColor="whiteAlpha.500"
                    _hover={{ bg: "whiteAlpha.100", borderColor: "white" }}
                    borderRadius="xl"
                    px={8}
                  >
                    <Link href="/login" style={{ textDecoration: "none" }}>
                      Sign In
                    </Link>
                  </Button>
                </>
              )}
            </Flex>
          </Container>
        </Box>

        {/* Features */}
        <Box bg="#F5F3FF" py={16} px={4} flex={1}>
          <Container maxW="1000px">
            <Text
              fontSize="2xl"
              fontWeight="700"
              color="indigo.900"
              textAlign="center"
              mb={2}
              letterSpacing="-0.02em"
            >
              Everything you need
            </Text>
            <Text
              fontSize="md"
              color="gray.500"
              textAlign="center"
              mb={10}
            >
              Manage your book catalog with ease
            </Text>
            <SimpleGrid columns={{ base: 1, sm: 3 }} gap={6}>
              <FeatureCard
                icon={<LuBookOpen size={20} />}
                title="Book Catalog"
                description="Add and organize books with title, author, year, and pricing in one place."
              />
              <FeatureCard
                icon={<LuUsers size={20} />}
                title="Author Management"
                description="Keep track of all authors in your catalog with quick search and bulk actions."
              />
              <FeatureCard
                icon={<LuSearch size={20} />}
                title="Fast Search"
                description="Instantly search across your entire collection by title or author name."
              />
              <FeatureCard
                icon={<LuShoppingCart size={20} />}
                title="Book Pricing"
                description="Set and display prices for books — ready for a storefront or inventory system."
              />
              <FeatureCard
                icon={<LuStar size={20} />}
                title="FINKI Project"
                description="Built as a college CI/CD project at FINKI — modern stack, production-ready."
              />
              <FeatureCard
                icon={<LuArrowRight size={20} />}
                title="REST API"
                description="Full FastAPI backend with async SQLAlchemy, Alembic migrations, and JWT auth."
              />
            </SimpleGrid>
          </Container>
        </Box>
      </Flex>
      <Footer />
      <Toaster />
    </>
  );
};

export default HomePage;
