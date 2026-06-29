import useRootApiService from "@/api/rootApi";
import {ApiResponseDto} from "@/dto/ApiResponseDto";
import {
  GetCurrentUserDto,
  SignUpRequestDto,
  SignUpResponseDto,
} from "@/dto/UsersDto";
import { useCallback, useMemo } from "react";

const useUsersService = () => {
  const { PostWithoutRefreshToken, Get } = useRootApiService();

  const createUser = useCallback(async (
    SignUpRequestDto: SignUpRequestDto
  ): Promise<ApiResponseDto<SignUpResponseDto>> => {
    const response = await PostWithoutRefreshToken<
      SignUpResponseDto,
      SignUpRequestDto
    >("/users/signup", SignUpRequestDto);

    return response;
  }, [PostWithoutRefreshToken]);

  const getCurrentUser = useCallback(async (): Promise<
    ApiResponseDto<GetCurrentUserDto>
  > => {
    const response = await Get<GetCurrentUserDto>("/users/me");

    return response;
  }, [Get]);

  return useMemo(() => ({ createUser, getCurrentUser }), [createUser, getCurrentUser]);
};

export default useUsersService;
