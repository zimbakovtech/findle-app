import useRootApiService from "@/api/rootApi";
import {ApiResponseDto} from "@/dto/ApiResponseDto";
import {
  GetCurrentUserDto,
  SignUpRequestDto,
  SignUpResponseDto,
} from "@/dto/UsersDto";

const useUsersService = () => {
  const { PostWithoutRefreshToken, Get } = useRootApiService();

  const createUser = async (
    SignUpRequestDto: SignUpRequestDto
  ): Promise<ApiResponseDto<SignUpResponseDto>> => {
    const response = await PostWithoutRefreshToken<
      SignUpResponseDto,
      SignUpRequestDto
    >("/users/signup", SignUpRequestDto);

    return response;
  };

  const getCurrentUser = async (): Promise<
    ApiResponseDto<GetCurrentUserDto>
  > => {
    const response = await Get<GetCurrentUserDto>("/users/me");

    return response;
  };

  return { createUser, getCurrentUser };
};

export default useUsersService;
