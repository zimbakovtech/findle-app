import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Card, Flex, Input, Stack, Text } from "@chakra-ui/react";
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
      <Flex direction="column" minHeight="100dvh" style={{ backgroundColor: "#F5F3FF" }}>
        <Header />
        <Flex direction="column" justify="center" align="center" flex="1" p={4}>
          <Flex align="center" gap={2} mb={6}>
            <LuBookOpen size={24} color="#4F46E5" />
            <Text fontWeight="700" fontSize="xl" style={{ color: "#4338CA" }}>
              Findle
            </Text>
          </Flex>

          <form onSubmit={handleSignUp} style={{ width: "100%", maxWidth: 400 }}>
            <Card.Root
              w="full"
              borderWidth={1}
              shadow="lg"
              style={{ borderColor: "#E0E7FF", backgroundColor: "#ffffff", borderRadius: "16px" }}
            >
              <Card.Header pb={2}>
                <Card.Title style={{ fontSize: "20px", fontWeight: 700, color: "#1E1B4B" }}>
                  Create your account
                </Card.Title>
                <Card.Description style={{ color: "#6B7280", fontSize: "14px" }}>
                  Join Findle — free forever
                </Card.Description>
              </Card.Header>
              <Card.Body>
                <Stack gap="4" w="full">
                  <Field label="Username" invalid={!!errors.username} errorText={errors.username?.message}>
                    <Input
                      style={{ borderColor: "#C7D2FE", color: "#1E1B4B", backgroundColor: "#ffffff" }}
                      _focus={{ borderColor: "#6366F1" }}
                      borderRadius="lg"
                      autoComplete="username"
                      {...register("username", {
                        required: "Username is required",
                        maxLength: { value: 50, message: "Username cannot exceed 50 characters" },
                      })}
                    />
                  </Field>
                  <Field label="Email" invalid={!!errors.email} errorText={errors.email?.message}>
                    <Input
                      style={{ borderColor: "#C7D2FE", color: "#1E1B4B", backgroundColor: "#ffffff" }}
                      _focus={{ borderColor: "#6366F1" }}
                      borderRadius="lg"
                      type="email"
                      autoComplete="email"
                      {...register("email", {
                        required: "Email is required",
                        maxLength: { value: 255, message: "Email cannot exceed 255 characters" },
                      })}
                    />
                  </Field>
                  <Field label="Password" invalid={!!errors.password} errorText={errors.password?.message}>
                    <Input
                      style={{ borderColor: "#C7D2FE", color: "#1E1B4B", backgroundColor: "#ffffff" }}
                      _focus={{ borderColor: "#6366F1" }}
                      borderRadius="lg"
                      type="password"
                      autoComplete="new-password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 8, message: "Password must be at least 8 characters" },
                      })}
                    />
                  </Field>
                </Stack>
              </Card.Body>
              <Card.Footer flexDirection="column" gap={3} pt={2}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: isLoading ? "#818CF8" : "#4F46E5",
                    border: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "background 150ms ease",
                    fontFamily: "'Inter', sans-serif",
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
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "#9CA3AF",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Clear form
                </button>
                <Text fontSize="sm" textAlign="center" style={{ color: "#6B7280" }}>
                  Already have an account?{" "}
                  <a href="/login" style={{ color: "#4F46E5", fontWeight: 500, textDecoration: "none" }}>
                    Sign in
                  </a>
                </Text>
              </Card.Footer>
            </Card.Root>
          </form>
        </Flex>
        <Toaster />
      </Flex>
    </>
  );
};

export default SignUpPage;
