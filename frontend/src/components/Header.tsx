import React from "react";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";
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
import { Button } from "@/components/ui/button";
import {
  LuBookOpen,
  LuMenu,
  LuLayoutDashboard,
  LuLogOut,
  LuLogIn,
  LuUserPlus,
  LuHouse,
} from "react-icons/lu";

const NAV_BG = "#0F172A";
const NAV_BORDER = "rgba(255,255,255,0.08)";

const NavLink: React.FC<{
  href: string;
  active: boolean;
  children: React.ReactNode;
}> = ({ href, active, children }) => (
  <a
    href={href}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 12px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: active ? 600 : 400,
      color: active ? "#ffffff" : "rgba(148,163,184,1)",
      backgroundColor: active ? "rgba(255,255,255,0.1)" : "transparent",
      textDecoration: "none",
      transition: "all 150ms ease",
      letterSpacing: "-0.01em",
    }}
  >
    {children}
  </a>
);

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", {
      state: { message: { title: "You have been logged out.", type: "info" } },
    });
  };

  return (
    <Box
      as="header"
      style={{ backgroundColor: NAV_BG, borderBottom: `1px solid ${NAV_BORDER}` }}
      px={4}
      py={0}
      position="sticky"
      top={0}
      zIndex={100}
    >
      <Flex
        justify="space-between"
        align="center"
        maxWidth="1200px"
        mx="auto"
        h="56px"
      >
        {/* Logo */}
        <a href="/" style={{ textDecoration: "none" }}>
          <Flex align="center" gap={2}>
            <Box
              w={7}
              h={7}
              bg="blue.500"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <LuBookOpen size={15} color="#ffffff" />
            </Box>
            <Text
              fontFamily="'Plus Jakarta Sans', sans-serif"
              fontWeight="700"
              fontSize="16px"
              letterSpacing="-0.02em"
              style={{ color: "#ffffff" }}
            >
              Findle
            </Text>
          </Flex>
        </a>

        {/* Desktop nav */}
        <HStack gap={1} display={{ base: "none", sm: "flex" }}>
          <NavLink href="/" active={location.pathname === "/"}>
            <LuHouse size={13} />
            Home
          </NavLink>

          {isAuthenticated && (
            <NavLink
              href="/dashboard"
              active={location.pathname === "/dashboard"}
            >
              <LuLayoutDashboard size={13} />
              Dashboard
            </NavLink>
          )}

          {!isAuthenticated && location.pathname !== "/login" && (
            <NavLink href="/login" active={false}>
              <LuLogIn size={13} />
              Sign in
            </NavLink>
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
                color: "#0F172A",
                backgroundColor: "#ffffff",
                textDecoration: "none",
                transition: "opacity 150ms ease",
                letterSpacing: "-0.01em",
              }}
            >
              <LuUserPlus size={13} />
              Sign up
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
                color: "rgba(148,163,184,1)",
                backgroundColor: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer",
                transition: "all 150ms ease",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              <LuLogOut size={13} />
              Sign out
            </button>
          )}
        </HStack>

        {/* Mobile hamburger */}
        <DrawerRoot size="xs" initialFocusEl={() => null}>
          <DrawerBackdrop />
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              style={{ color: "rgba(148,163,184,1)" }}
              _hover={{ bg: "rgba(255,255,255,0.06)" }}
              display={{ base: "flex", sm: "none" }}
            >
              <LuMenu size={18} />
            </Button>
          </DrawerTrigger>
          <DrawerContent style={{ backgroundColor: "#0F172A", borderRight: `1px solid ${NAV_BORDER}` }}>
            <DrawerHeader borderBottomWidth="1px" style={{ borderColor: NAV_BORDER }}>
              <DrawerTitle>
                <Flex align="center" gap={2}>
                  <Box
                    w={6}
                    h={6}
                    bg="blue.500"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <LuBookOpen size={13} color="#ffffff" />
                  </Box>
                  <Text
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    fontWeight="700"
                    style={{ color: "#ffffff" }}
                  >
                    Findle
                  </Text>
                </Flex>
              </DrawerTitle>
            </DrawerHeader>
            <DrawerBody p={4}>
              <Flex direction="column" gap={1}>
                {[
                  { href: "/", label: "Home", show: true },
                  { href: "/dashboard", label: "Dashboard", show: isAuthenticated },
                  { href: "/login", label: "Sign in", show: !isAuthenticated && location.pathname !== "/login" },
                  { href: "/signup", label: "Sign up", show: !isAuthenticated && location.pathname !== "/signup" },
                ]
                  .filter((item) => item.show)
                  .map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      style={{
                        display: "block",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: location.pathname === item.href ? "#ffffff" : "rgba(148,163,184,1)",
                        textDecoration: "none",
                        backgroundColor:
                          location.pathname === item.href
                            ? "rgba(255,255,255,0.08)"
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
                      padding: "9px 12px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#F87171",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      width: "100%",
                      marginTop: "8px",
                    }}
                  >
                    Sign out
                  </button>
                )}
              </Flex>
            </DrawerBody>
            <DrawerCloseTrigger style={{ color: "rgba(148,163,184,1)" }} />
          </DrawerContent>
        </DrawerRoot>
      </Flex>
    </Box>
  );
};

export default Header;
