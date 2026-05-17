export interface GetBooksParams {
  title?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

export interface BookResponseDto {
  id: number;
  title: string;
  year: number;
  author: string;
  price?: number | null;
}

export interface GetBooksResponseDto {
  books: BookResponseDto[];
  total_results: number;
}

export interface PostBodyCreateBookDto {
  title: string;
  year: number;
  author_id: number;
  price?: number | null;
}

export interface DeleteBooksBodyBatchDto {
  ids: number[];
}
