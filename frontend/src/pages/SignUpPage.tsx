import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { Toaster, toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import useUsersService from "@/api/usersApi";
import { getErrorDetail } from "@/dto/ApiResponseDto";
import { SignUpRequestDto } from "@/dto/UsersDto";
import { LuBookOpen } from "react-icons/lu";

const SignUpPage = () => {
  const { createUser } = useUsersService();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpRequestDto>({ mode: "onChange" });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignUp = handleSubmit(async (data: SignUpRequestDto) => {
    if (isLoading) return;
    setIsLoading(true);
    const response = await createUser(data);
    if (response.data && response.success) {
      navigate("/login", {
        state: { message: { title: "Account created! Sign in to continue.", type: "success" } },
      });
    } else {
      if (Array.isArray(response.error)) {
        response.error.forEach((msg: string) => toaster.create({ title: msg, type: "error" }));
      } else {
        toaster.create({ title: getErrorDetail(response.error), type: "error" });
      }
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
            <Box px={6} pt={6} pb={5} borderBottom="1px solid #F1F5F9">
              <Text
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontWeight="800"
                fontSize="20px"
                letterSpacing="-0.02em"
                color="#0F172A"
                mb={0.5}
              >
                Create your account
              </Text>
              <Text fontSize="13px" color="#64748B">
                Join Findle — free forever
              </Text>
            </Box>

            <form onSubmit={handleSignUp}>
              <Box px={6} py={5}>
                <Stack gap={4}>
                  <Field
                    label="Username"
                    invalid={!!errors.username}
                    errorText={errors.username?.message}
                  >
                    <Input
                      autoComplete="username"
                      borderColor="#E2E8F0"
                      borderRadius="9px"
                      fontSize="14px"
                      _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 3px rgba(37,99,235,0.1)" }}
                      {...register("username", {
                        required: "Username is required",
                        maxLength: { value: 50, message: "Username cannot exceed 50 characters" },
                      })}
                    />
                  </Field>
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
                      autoComplete="new-password"
                      borderColor="#E2E8F0"
                      borderRadius="9px"
                      fontSize="14px"
                      _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 3px rgba(37,99,235,0.1)" }}
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 8, message: "Password must be at least 8 characters" },
                      })}
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
                    {isLoading ? "Creating account…" : "Create account"}
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
                    Already have an account?{" "}
                    <a
                      href="/login"
                      style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}
                    >
                      Sign in
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
};

export default SignUpPage;
