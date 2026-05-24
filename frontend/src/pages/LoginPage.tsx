import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { Toaster, toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import useAuthService from "@/api/authApi";
import { getErrorDetail } from "@/dto/ApiResponseDto";
import { SignInDto } from "@/dto/UsersDto";
import { LuBookOpen } from "react-icons/lu";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignInDto>({ mode: "onChange" });
  const { signInUser } = useAuthService();

  useEffect(() => {
    if (location.state?.message) {
      toaster.create({
        title: location.state.message.title,
        type: location.state.message.type,
      });
    }
    navigate(location.pathname, { replace: true });
  }, [location.state, location.pathname, navigate]);

  const handleLogin = handleSubmit(async (data) => {
    if (isLoading) return;
    setIsLoading(true);
    const response = await signInUser({ email: data.email, password: data.password });
    if (response.data && response.success) {
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } else {
      toaster.create({ title: getErrorDetail(response.error), type: "error" });
    }
    setIsLoading(false);
  });

  return (
    <>
      <Flex direction="column" minHeight="100dvh" style={{ backgroundColor: "#F8FAFC" }}>
        <Header />
        <Flex direction="column" justify="center" align="center" flex="1" px={4} py={8}>

          {/* Logo mark */}
          <Flex align="center" gap={2} mb={7}>
            <Box
              w={8}
              h={8}
              bg="#2563EB"
              borderRadius="9px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <LuBookOpen size={16} color="#ffffff" />
            </Box>
            <Text
              fontFamily="'Plus Jakarta Sans', sans-serif"
              fontWeight="800"
              fontSize="18px"
              letterSpacing="-0.02em"
              style={{ color: "#0F172A" }}
            >
              Findle
            </Text>
          </Flex>

          {/* Card */}
          <Box
            w="full"
            maxW="400px"
            bg="white"
            borderRadius="16px"
            border="1px solid #E2E8F0"
            boxShadow="0 1px 3px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.04)"
            overflow="hidden"
          >
            {/* Card header */}
            <Box px={6} pt={6} pb={5} borderBottom="1px solid #F1F5F9">
              <Text
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontWeight="800"
                fontSize="20px"
                letterSpacing="-0.02em"
                color="#0F172A"
                mb={0.5}
              >
                Welcome back
              </Text>
              <Text fontSize="13px" color="#64748B">
                Sign in to your Findle account
              </Text>
            </Box>

            {/* Form */}
            <form onSubmit={handleLogin}>
              <Box px={6} py={5}>
                <Stack gap={4}>
                  <Field
                    label="Email"
                    invalid={!!errors.email}
                    errorText={errors.email?.message}
                  >
                    <Input
                      type="email"
                      autoComplete="email"
                      borderColor="#E2E8F0"
                      borderRadius="9px"
                      fontSize="14px"
                      _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 3px rgba(37,99,235,0.1)" }}
                      {...register("email", {
                        required: "Email is required",
                        maxLength: { value: 255, message: "Email cannot exceed 255 characters" },
                      })}
                    />
                  </Field>
                  <Field
                    label="Password"
                    invalid={!!errors.password}
                    errorText={errors.password?.message}
                  >
                    <Input
                      type="password"
                      autoComplete="current-password"
                      borderColor="#E2E8F0"
                      borderRadius="9px"
                      fontSize="14px"
                      _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 3px rgba(37,99,235,0.1)" }}
                      {...register("password", { required: "Password is required" })}
                    />
                  </Field>
                </Stack>
              </Box>

              <Box px={6} pb={6}>
                <Stack gap={3}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      borderRadius: "9px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#ffffff",
                      backgroundColor: isLoading ? "#93C5FD" : "#2563EB",
                      border: "none",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      transition: "background 150ms ease",
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {isLoading ? "Signing in…" : "Sign in"}
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => reset()}
                    style={{
                      width: "100%",
                      padding: "8px 16px",
                      borderRadius: "9px",
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "#94A3B8",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Clear form
                  </button>
                  <Text fontSize="13px" textAlign="center" color="#64748B">
                    No account?{" "}
                    <a
                      href="/signup"
                      style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}
                    >
                      Sign up free
                    </a>
                  </Text>
                </Stack>
              </Box>
            </form>
          </Box>
        </Flex>
        <Toaster />
      </Flex>
    </>
  );
}
