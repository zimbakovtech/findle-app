import useRootApiService from "@/api/rootApi";
import { ApiResponseDto, MessageDto } from "@/dto/ApiResponseDto";
import {
  BookResponseDto,
  DeleteBooksBodyBatchDto,
  GetBooksResponseDto,
  PostBodyCreateBookDto,
  GetBooksParams,
} from "@/dto/BooksDto";
import { useCallback, useMemo } from "react";

const useBooksService = () => {
  const { Get, Post } = useRootApiService();

  const getBooks = useCallback(async (
    params?: GetBooksParams
  ): Promise<ApiResponseDto<GetBooksResponseDto>> => {
    const response = await Get<GetBooksResponseDto>("/books", params);

    return response;
  }, [Get]);

  const createBook = useCallback(async (
    data: PostBodyCreateBookDto
  ): Promise<ApiResponseDto<BookResponseDto>> => {
    const response = await Post<BookResponseDto, PostBodyCreateBookDto>(
      "/books",
      data
    );

    return response;
  }, [Post]);

  const deleteBooksBatch = useCallback(async (
    data: DeleteBooksBodyBatchDto
  ): Promise<ApiResponseDto<MessageDto>> => {
    const response = await Post<MessageDto, DeleteBooksBodyBatchDto>(
      "/books/delete/batch",
      data
    );

    return response;
  }, [Post]);

  return useMemo(
    () => ({ getBooks, createBook, deleteBooksBatch }),
    [getBooks, createBook, deleteBooksBatch]
  );
};

export default useBooksService;
