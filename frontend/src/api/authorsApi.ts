import useRootApiService from "@/api/rootApi";
import { ApiResponseDto, MessageDto } from "@/dto/ApiResponseDto";
import {
  GetAuthorsResponseDto,
  GetAuthorsParams,
  AuthorResponseDto,
  PostBodyCreateAuthorDto,
  DeleteAuthorsBatchDto,
} from "@/dto/AuthorsDto";
import { useCallback, useMemo } from "react";

const useAuthorsService = () => {
  const { Get, Post } = useRootApiService();

  const getAuthors = useCallback(async (
    params?: GetAuthorsParams
  ): Promise<ApiResponseDto<GetAuthorsResponseDto>> => {
    const response = await Get<GetAuthorsResponseDto>("/authors", params);

    return response;
  }, [Get]);

  const createAuthor = useCallback(async (
    data: PostBodyCreateAuthorDto
  ): Promise<ApiResponseDto<AuthorResponseDto>> => {
    const response = await Post<AuthorResponseDto, PostBodyCreateAuthorDto>(
      "/authors",
      data
    );

    return response;
  }, [Post]);

  const deleteAuthorsBatch = useCallback(async (
    data: DeleteAuthorsBatchDto
  ): Promise<ApiResponseDto<MessageDto>> => {
    const response = await Post<MessageDto, DeleteAuthorsBatchDto>(
      "/authors/delete/batch",
      data
    );

    return response;
  }, [Post]);

  return useMemo(
    () => ({ getAuthors, createAuthor, deleteAuthorsBatch }),
    [getAuthors, createAuthor, deleteAuthorsBatch]
  );
};

export default useAuthorsService;
