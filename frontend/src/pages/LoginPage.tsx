import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Flex,
  Input,
  Stack,
  Text,
  Link,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Toaster, toaster } from "@/components/ui/toaster";

import Header from "@/components/Header";
import useAuthService from "@/api/authApi";
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
  }, [location.state]);

  const handleLogin = handleSubmit(async (data) => {
    if (isLoading) return;
    setIsLoading(true);

    const response = await signInUser({
      email: data.email,
      password: data.password,
    });
    if (response.data && response.success) {
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } else {
      toaster.create({
        title: response.error?.detail ?? "An error occurred",
        type: "error",
      });
    }

    setIsLoading(false);
  });

  return (
    <>
      <Flex direction="column" minHeight="100dvh" bg="#F5F3FF">
        <Header />

        <Flex direction="column" justify="center" align="center" flex="1" p={4}>
          <Flex align="center" gap={2} mb={6} color="indigo.600">
            <LuBookOpen size={24} />
            <Text fontWeight="700" fontSize="xl" color="indigo.700">
              Findle
            </Text>
          </Flex>

          <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: 400 }}>
            <Card.Root
              w="full"
              borderWidth={1}
              shadow="lg"
              borderColor="indigo.100"
              bg="white"
              borderRadius="2xl"
            >
              <Card.Header pb={2}>
                <Card.Title
                  fontSize="xl"
                  fontWeight="700"
                  color="indigo.900"
                >
                  Welcome back
                </Card.Title>
                <Card.Description color="gray.500" fontSize="sm">
                  Sign in to your Findle account
                </Card.Description>
              </Card.Header>
              <Card.Body>
                <Stack gap="4" w="full">
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
                      autoComplete="current-password"
                      {...register("password", {
                        required: "Password is required",
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
                  Sign in
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
                  No account yet?{" "}
                  <Link href="/signup" color="indigo.600" fontWeight="500">
                    Sign up free
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
}
