import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination";
import { HStack } from "@chakra-ui/react";

import { PageProps } from "@/pages/dashboard/Types";

const Pagination: React.FC<PageProps> = (pageProps) => {
  const { totalResults, pageSize, currentPage, setCurrentPage } = pageProps;

  return (
    <PaginationRoot
      count={totalResults}
      pageSize={pageSize}
      defaultPage={1}
      page={currentPage}
      onPageChange={(e) => {
        setCurrentPage(e.page);
      }}
    >
      <HStack>
        <PaginationPrevTrigger color="indigo.700" />
        <PaginationItems color="indigo.700" />
        <PaginationNextTrigger color="indigo.700" />
      </HStack>
    </PaginationRoot>
  );
};

export default Pagination;
