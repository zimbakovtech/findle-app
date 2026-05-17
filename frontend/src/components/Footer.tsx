import { Text, Box, Flex } from "@chakra-ui/react";
import { LuBookOpen } from "react-icons/lu";

export default function Footer() {
  return (
    <Box
      as="footer"
      style={{ backgroundColor: "#3730A3" }}
      py={6}
      px={4}
      mt={8}
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
          <LuBookOpen size={18} color="#ffffff" />
          <Text fontWeight="700" fontSize="sm" style={{ color: "#ffffff" }}>
            Findle
          </Text>
        </Flex>

        <Text fontSize="xs" style={{ color: "#A5B4FC" }} textAlign="center">
          © {new Date().getFullYear()} Findle — digital book catalog for FINKI
        </Text>

        <Text fontSize="xs" style={{ color: "#A5B4FC" }}>
          Built by{" "}
          <span style={{ color: "#C7D2FE", fontWeight: 600 }}>
            Damjan Zimbakov
          </span>
        </Text>
      </Flex>
    </Box>
  );
}
