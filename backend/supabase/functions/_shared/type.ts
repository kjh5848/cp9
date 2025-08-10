

export type ApiSuccess<T> ={
    success : true;
    data: T;
}

export type ApiError ={
    sucess: false;
    error: string;
    code?: string;

}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type CandidateItem = {
    id: string;
    url: string;
    title: string;
    priceKRW?: number | null;
    isRocket?: boolean;
    image?: string | null;
    categoryPath?: string[];
}

export type ResearchPack = {
    itemId: string;
    title?: string;
    priceKRW?: number | null;
    isRocket?: boolean | null;
    features?: string[];
    pros?: string[];
    cons?: string[];
    keywords?: string[];
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
  };


  export type SeoDraft = {
    itemId: string;
    meta: {
      title: string;
      description: string;
      slug: string;
      tags?: string[];
    };
    markdown: string; // 본문
  };