import { Text, Box, Flex } from "@chakra-ui/react";
import { LuBookOpen } from "react-icons/lu";

export default function Footer() {
  return (
    <Box
      as="footer"
      style={{
        backgroundColor: "#0F172A",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
      py={5}
      px={4}
    >
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align="center"
        maxWidth="1200px"
        mx="auto"
        gap={3}
      >
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
            fontSize="14px"
            letterSpacing="-0.01em"
            style={{ color: "#ffffff" }}
          >
            Findle
          </Text>
        </Flex>

        <Text fontSize="xs" style={{ color: "rgba(100,116,139,1)" }} textAlign="center">
          © {new Date().getFullYear()} Findle — digital book catalog for FINKI
        </Text>

        <Text fontSize="xs" style={{ color: "rgba(100,116,139,1)" }}>
          Built by{" "}
          <span style={{ color: "rgba(148,163,184,1)", fontWeight: 500 }}>
            Damjan Zimbakov
          </span>
        </Text>
      </Flex>
    </Box>
  );
}
