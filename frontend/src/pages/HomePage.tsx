import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  Text,
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
  LuShieldCheck,
  LuZap,
} from "react-icons/lu";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <Box
    bg="white"
    borderRadius="12px"
    p={6}
    border="1px solid #E2E8F0"
    _hover={{
      borderColor: "#CBD5E1",
      boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
      transform: "translateY(-2px)",
    }}
    transition="all 200ms ease"
  >
    <Box
      w={9}
      h={9}
      bg="#EFF6FF"
      borderRadius="8px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="#2563EB"
      mb={4}
    >
      {icon}
    </Box>
    <Text
      fontFamily="'Plus Jakarta Sans', sans-serif"
      fontWeight="700"
      fontSize="15px"
      color="#0F172A"
      mb={1.5}
      letterSpacing="-0.01em"
    >
      {title}
    </Text>
    <Text fontSize="13px" color="#64748B" lineHeight="1.65">
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
      <Flex direction="column" minHeight="calc(100dvh - 56px)">
        {/* Hero */}
        <Box
          style={{
            background: "linear-gradient(160deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)",
          }}
          py={{ base: 20, sm: 28 }}
          px={4}
          position="relative"
          overflow="hidden"
        >
          {/* Subtle blue glow */}
          <Box
            position="absolute"
            top="30%"
            left="50%"
            transform="translate(-50%, -50%)"
            w="600px"
            h="400px"
            style={{
              background: "radial-gradient(ellipse at center, rgba(37,99,235,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <Container maxW="800px" textAlign="center" position="relative">
            {/* Badge */}
            <Flex justify="center" mb={6}>
              <Box
                display="inline-flex"
                alignItems="center"
                gap={1.5}
                px={3}
                py={1}
                borderRadius="full"
                border="1px solid rgba(37,99,235,0.4)"
                style={{ backgroundColor: "rgba(37,99,235,0.1)" }}
              >
                <LuBookOpen size={12} color="#60A5FA" />
                <Text fontSize="12px" fontWeight="500" style={{ color: "#60A5FA" }}>
                  Digital Book Catalog
                </Text>
              </Box>
            </Flex>

            <Text
              fontFamily="'Plus Jakarta Sans', sans-serif"
              fontSize={{ base: "42px", sm: "64px" }}
              fontWeight="800"
              letterSpacing="-0.04em"
              lineHeight="1.05"
              mb={5}
            >
              <span style={{ color: "#ffffff" }}>Manage your</span>
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #60A5FA 0%, #38BDF8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                book catalog
              </span>
            </Text>

            <Text
              fontSize={{ base: "15px", sm: "17px" }}
              style={{ color: "rgba(148,163,184,1)" }}
              mb={8}
              maxW="480px"
              mx="auto"
              lineHeight="1.65"
            >
              Discover, organize, and track your reading collection at FINKI
              with a clean, fast catalog tool.
            </Text>

            <Flex gap={3} justify="center" direction={{ base: "column", sm: "row" }}>
              {isAuthenticated ? (
                <a
                  href="/dashboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "11px 22px",
                    borderRadius: "10px",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: "#2563EB",
                    textDecoration: "none",
                    transition: "background 150ms ease",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Go to Dashboard
                  <LuArrowRight size={15} />
                </a>
              ) : (
                <>
                  <a
                    href="/signup"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "11px 22px",
                      borderRadius: "10px",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#ffffff",
                      backgroundColor: "#2563EB",
                      textDecoration: "none",
                      transition: "background 150ms ease",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Get started free
                    <LuArrowRight size={15} />
                  </a>
                  <a
                    href="/login"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "11px 22px",
                      borderRadius: "10px",
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "rgba(148,163,184,1)",
                      backgroundColor: "transparent",
                      border: "1px solid rgba(255,255,255,0.12)",
                      textDecoration: "none",
                      transition: "all 150ms ease",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Sign in
                  </a>
                </>
              )}
            </Flex>
          </Container>
        </Box>

        {/* Features */}
        <Box bg="#F8FAFC" py={{ base: 14, sm: 20 }} px={4} flex={1}>
          <Container maxW="960px">
            <Box textAlign="center" mb={10}>
              <Text
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontSize={{ base: "24px", sm: "30px" }}
                fontWeight="800"
                color="#0F172A"
                letterSpacing="-0.03em"
                mb={2}
              >
                Everything you need
              </Text>
              <Text fontSize="15px" color="#64748B">
                A complete toolkit to manage books and authors
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={5}>
              <FeatureCard
                icon={<LuBookOpen size={18} />}
                title="Book Catalog"
                description="Add and organize books with title, author, year, and pricing all in one place."
              />
              <FeatureCard
                icon={<LuUsers size={18} />}
                title="Author Management"
                description="Track all authors with fast search and bulk delete operations."
              />
              <FeatureCard
                icon={<LuSearch size={18} />}
                title="Instant Search"
                description="Search across your entire collection by title or author name in real time."
              />
              <FeatureCard
                icon={<LuShieldCheck size={18} />}
                title="JWT Auth"
                description="Secure JWT-based authentication with protected routes and token management."
              />
              <FeatureCard
                icon={<LuZap size={18} />}
                title="FastAPI Backend"
                description="Async FastAPI backend with SQLAlchemy, Alembic migrations, and full CRUD."
              />
              <FeatureCard
                icon={<LuArrowRight size={18} />}
                title="CI/CD Pipeline"
                description="Full GitHub Actions CI/CD — lint, test, Docker build, and tag-triggered deploys."
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
