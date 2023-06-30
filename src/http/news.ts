import axios from 'axios';
import { uniqBy } from 'lodash';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2/';
const PAGE_SIZE = 6;

export type ArticleResponse = {
  articleUrl: string;
  imageUrl?: string;
  author: string;
  title: string;
};

type BaseArticle = {
  url: string;
  urlToImage: string;
  author: string;
  title: string;
};

export const getLatestNews = async (about: string, language: string): Promise<ArticleResponse[]> => {
  const response = await axios.get<{ articles: BaseArticle[] }>(`${BASE_URL}everything?apiKey=${NEWS_API_KEY}&q=${about}&searchIn=title,description&language=${language}&sortBy=publishedAt&pageSize=${PAGE_SIZE}`);

  const articles: ArticleResponse[] = response.data.articles.map((item) => ({
    articleUrl: item.url,
    imageUrl: item.urlToImage,
    author: item.author,
    title: item.title,
  }));

  return uniqBy(articles, (item: ArticleResponse) => item.title);
};
