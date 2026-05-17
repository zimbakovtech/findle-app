import useRootApiService from "@/api/rootApi";
import { ApiResponseDto, MessageDto } from "@/dto/ApiResponseDto";
import {
  BookResponseDto,
  DeleteBooksBodyBatchDto,
  GetBooksResponseDto,
  PostBodyCreateBookDto,
  GetBooksParams,
} from "@/dto/BooksDto";

const useBooksService = () => {
  const { Get, Post } = useRootApiService();

  const getBooks = async (
    params?: GetBooksParams
  ): Promise<ApiResponseDto<GetBooksResponseDto>> => {
    const response = await Get<GetBooksResponseDto>("/books", params);

    return response;
  };

  const createBook = async (
    data: PostBodyCreateBookDto
  ): Promise<ApiResponseDto<BookResponseDto>> => {
    const response = await Post<BookResponseDto, PostBodyCreateBookDto>(
      "/books",
      data
    );

    return response;
  };

  const deleteBooksBatch = async (
    data: DeleteBooksBodyBatchDto
  ): Promise<ApiResponseDto<MessageDto>> => {
    const response = Post<MessageDto, DeleteBooksBodyBatchDto>(
      "/books/delete/batch",
      data
    );

    return response;
  };

  return { getBooks, createBook, deleteBooksBatch };
};

export default useBooksService;
