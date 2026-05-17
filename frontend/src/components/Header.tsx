import React from "react";
import { Box, Flex, Button, HStack, Text } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  LuBookOpen,
  LuMenu,
  LuLayoutDashboard,
  LuLogOut,
  LuLogIn,
  LuUserPlus,
  LuHouse,
} from "react-icons/lu";

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", {
      state: {
        message: { title: "You have been logged out.", type: "info" },
      },
    });
  };

  const navLinkStyle = (active: boolean) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: active ? 600 : 400,
    color: active ? "#ffffff" : "rgba(199,210,254,1)",
    backgroundColor: active ? "rgba(255,255,255,0.15)" : "transparent",
    textDecoration: "none",
    transition: "all 150ms ease",
    cursor: "pointer",
    border: "none",
    background: active ? "rgba(255,255,255,0.15)" : "transparent",
  });

  return (
    <Box
      as="header"
      style={{ backgroundColor: "#4F46E5" }}
      px={4}
      py={3}
      boxShadow="0 2px 8px rgba(79,70,229,0.4)"
      position="sticky"
      top={0}
      zIndex={100}
    >
      <Flex justify="space-between" align="center" maxWidth="1200px" mx="auto">

        {/* Logo — plain anchor, no Chakra Button wrapper */}
        <a href="/" style={{ textDecoration: "none" }}>
          <Flex align="center" gap={2} style={{ color: "#ffffff" }}>
            <LuBookOpen size={22} color="#ffffff" />
            <Text
              fontWeight="700"
              fontSize="lg"
              letterSpacing="-0.02em"
              style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif" }}
            >
              Findle
            </Text>
          </Flex>
        </a>

        {/* Desktop nav */}
        <HStack gap={1} display={{ base: "none", sm: "flex" }}>
          <a href="/" style={navLinkStyle(location.pathname === "/")}>
            <LuHouse size={14} />
            Home
          </a>

          {isAuthenticated && (
            <a
              href="/dashboard"
              style={navLinkStyle(location.pathname === "/dashboard")}
            >
              <LuLayoutDashboard size={14} />
              Dashboard
            </a>
          )}

          {!isAuthenticated && location.pathname !== "/login" && (
            <a href="/login" style={navLinkStyle(false)}>
              <LuLogIn size={14} />
              Login
            </a>
          )}

          {!isAuthenticated && location.pathname !== "/signup" && (
            <a
              href="/signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#4338CA",
                backgroundColor: "#ffffff",
                textDecoration: "none",
                transition: "background 150ms ease",
                cursor: "pointer",
              }}
            >
              <LuUserPlus size={14} />
              Sign Up
            </a>
          )}

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#ffffff",
                backgroundColor: "transparent",
                border: "1.5px solid rgba(255,255,255,0.4)",
                cursor: "pointer",
                transition: "all 150ms ease",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <LuLogOut size={14} />
              Logout
            </button>
          )}
        </HStack>

        {/* Mobile hamburger */}
        <DrawerRoot size="xs" initialFocusEl={() => null}>
          <DrawerBackdrop />
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              style={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.4)" }}
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
              display={{ base: "flex", sm: "none" }}
            >
              <LuMenu color="#ffffff" />
            </Button>
          </DrawerTrigger>
          <DrawerContent style={{ backgroundColor: "#4338CA" }}>
            <DrawerHeader
              borderBottomWidth="1px"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}
            >
              <DrawerTitle>
                <Flex align="center" gap={2} style={{ color: "#ffffff" }}>
                  <LuBookOpen size={18} color="#ffffff" />
                  <Text fontWeight="700" style={{ color: "#ffffff" }}>
                    Findle
                  </Text>
                </Flex>
              </DrawerTitle>
            </DrawerHeader>
            <DrawerBody p={4}>
              <Flex direction="column" gap={2}>
                {[
                  { href: "/", label: "Home", show: true },
                  {
                    href: "/dashboard",
                    label: "Dashboard",
                    show: isAuthenticated,
                  },
                  {
                    href: "/login",
                    label: "Login",
                    show: !isAuthenticated && location.pathname !== "/login",
                  },
                  {
                    href: "/signup",
                    label: "Sign Up",
                    show: !isAuthenticated && location.pathname !== "/signup",
                  },
                ]
                  .filter((item) => item.show)
                  .map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      style={{
                        display: "block",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        fontSize: "15px",
                        fontWeight: 500,
                        color: "#ffffff",
                        textDecoration: "none",
                        backgroundColor:
                          location.pathname === item.href
                            ? "rgba(255,255,255,0.15)"
                            : "transparent",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {item.label}
                    </a>
                  ))}

                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "block",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "#FCA5A5",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      width: "100%",
                    }}
                  >
                    Logout
                  </button>
                )}
              </Flex>
            </DrawerBody>
            <DrawerCloseTrigger
              style={{ color: "#ffffff" }}
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
            />
          </DrawerContent>
        </DrawerRoot>
      </Flex>
    </Box>
  );
};

export default Header;
