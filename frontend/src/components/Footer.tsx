import { Text, Box, Flex, Link } from "@chakra-ui/react";
import { LuBookOpen, LuHeart } from "react-icons/lu";

export default function Footer() {
  return (
    <Box
      as="footer"
      bg="indigo.700"
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
        <Flex align="center" gap={2} color="white">
          <LuBookOpen size={18} />
          <Text fontWeight="700" fontSize="sm">
            Findle
          </Text>
        </Flex>

        <Text fontSize="xs" color="indigo.300" textAlign="center">
          © {new Date().getFullYear()} Findle — digital book catalog for FINKI
        </Text>

        <Flex align="center" gap={1}>
          <Text fontSize="xs" color="indigo.300">
            Made with
          </Text>
          <LuHeart size={12} color="#A5B4FC" />
          <Text fontSize="xs" color="indigo.300">
            based on{" "}
            <Link
              href="https://github.com/lealre/madr-fullstack"
              target="_blank"
              color="indigo.200"
              _hover={{ color: "white" }}
            >
              madr-fullstack
            </Link>
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
