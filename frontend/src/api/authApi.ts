import useRootApiService from "@/api/rootApi";
import {ApiResponseDto} from "@/dto/ApiResponseDto";
import { TokenResponseDto } from "@/dto/AuthDto";
import { SignInDto } from "@/dto/UsersDto";
import { useCallback, useMemo } from "react";

const useAuthService = () => {
  const { PostWithoutRefreshToken } = useRootApiService();

  const signInUser = useCallback(async (
    signInDto: SignInDto
  ): Promise<ApiResponseDto<TokenResponseDto>> => {
    const formData = new URLSearchParams();
    formData.append("username", signInDto.email);
    formData.append("password", signInDto.password);

    const response = await PostWithoutRefreshToken<
      TokenResponseDto,
      URLSearchParams
    >("/auth/token", formData);

    return response;
  }, [PostWithoutRefreshToken]);

  return useMemo(() => ({ signInUser }), [signInUser]);
};

export default useAuthService;

