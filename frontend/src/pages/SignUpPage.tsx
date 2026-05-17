import { Box, Card, Flex, Input, Stack, Text, Link } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useForm } from "react-hook-form";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

import useUsersService from "@/api/usersApi";
import { Toaster, toaster } from "@/components/ui/toaster";
import { SignUpRequestDto } from "@/dto/UsersDto";
import { useState } from "react";
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
        state: {
          message: {
            title: "Account created! Sign in to continue.",
            type: "success",
          },
        },
      });
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
          title: response.error?.detail ?? "An error occurred",
          type: "error",
        });
      }
    }

    setIsLoading(false);
  });

  return (
    <>
      <Flex direction="column" minHeight="100dvh" bg="#F5F3FF">
        <Box>
          <Header />
        </Box>
        <Flex
          direction="column"
          justify="center"
          align="center"
          flex="1"
          p={4}
        >
          <Flex align="center" gap={2} mb={6} color="indigo.600">
            <LuBookOpen size={24} />
            <Text fontWeight="700" fontSize="xl" color="indigo.700">
              Findle
            </Text>
          </Flex>

          <form onSubmit={handleSignUp} style={{ width: "100%", maxWidth: 400 }}>
            <Card.Root
              w="full"
              borderWidth={1}
              shadow="lg"
              borderColor="indigo.100"
              bg="white"
              borderRadius="2xl"
            >
              <Card.Header pb={2}>
                <Card.Title fontSize="xl" fontWeight="700" color="indigo.900">
                  Create your account
                </Card.Title>
                <Card.Description color="gray.500" fontSize="sm">
                  Join Findle — free forever
                </Card.Description>
              </Card.Header>
              <Card.Body>
                <Stack gap="4" w="full">
                  <Field
                    label="Username"
                    invalid={!!errors.username}
                    errorText={errors.username?.message}
                  >
                    <Input
                      borderColor="indigo.200"
                      _focus={{ borderColor: "indigo.500" }}
                      borderRadius="lg"
                      autoComplete="username"
                      {...register("username", {
                        required: "Username is required",
                        maxLength: {
                          value: 50,
                          message: "Username cannot exceed 50 characters",
                        },
                      })}
                    />
                  </Field>
                  <Field
                    label="Email"
                    invalid={!!errors.email}
                    errorText={errors.email?.message}
                  >
                    <Input
                      borderColor="indigo.200"
                      _focus={{ borderColor: "indigo.500" }}
                      borderRadius="lg"
                      type="email"
                      autoComplete="email"
                      {...register("email", {
                        required: "Email is required",
                        maxLength: {
                          value: 255,
                          message: "Email cannot exceed 255 characters",
                        },
                      })}
                    />
                  </Field>
                  <Field
                    label="Password"
                    invalid={!!errors.password}
                    errorText={errors.password?.message}
                  >
                    <Input
                      borderColor="indigo.200"
                      _focus={{ borderColor: "indigo.500" }}
                      borderRadius="lg"
                      type="password"
                      autoComplete="new-password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                      })}
                    />
                  </Field>
                </Stack>
              </Card.Body>
              <Card.Footer flexDirection="column" gap={3} pt={2}>
                <Button
                  type="submit"
                  loading={isLoading}
                  width="full"
                  bg="indigo.600"
                  color="white"
                  _hover={{ bg: "indigo.700" }}
                  borderRadius="lg"
                  fontWeight="600"
                >
                  Create account
                </Button>
                <Button
                  variant="ghost"
                  loading={isLoading}
                  onClick={() => reset()}
                  width="full"
                  borderRadius="lg"
                  color="gray.500"
                  size="sm"
                >
                  Clear form
                </Button>
                <Text fontSize="sm" textAlign="center" color="gray.500">
                  Already have an account?{" "}
                  <Link href="/login" color="indigo.600" fontWeight="500">
                    Sign in
                  </Link>
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
