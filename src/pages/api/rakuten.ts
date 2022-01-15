import moji from "moji";
import type { NextApiRequest, NextApiResponse } from "next";

const compare = (a: bookData, b: bookData) => a.title < b.title ? -1 : 1;

type rakuktenItem = {
  Item: bookItem;
};

type bookItem = {
  title: string;
  author: string;
  publisherName: string;
  largeImageUrl: string;
  isbn: string;
};

export type bookData = {
  title: string;
  author: string;
  publisherName: string;
  imageUrl: string;
  isbn: string;
};

const convertToUtf8 = (text: string) => unescape(encodeURIComponent(text));
const extractData = (item: rakuktenItem) => {
  let titleString = item.Item.title;
  titleString = moji(titleString).convert('ZE', 'HE').toString();
  titleString = moji(titleString).convert('ZS', 'HS').toString();

  let authorString = item.Item.author;
  authorString = moji(authorString).convert('ZE', 'HE').toString();
  authorString = moji(authorString).convert('ZS', 'HS').reject('HS').toString();

  return {
    title: titleString,
    author: authorString,
    publisherName: item.Item.publisherName,
    imageUrl: item.Item.largeImageUrl,
    isbn: item.Item.isbn,
  } as const;
};

const Rakuten = async (req: NextApiRequest, res: NextApiResponse) => {
  let url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${process.env.RAKUTEN_APP_ID}&booksGenreId=001001`;

  const { title, author } = req.query;
  if (title) {
    url += `&title=${convertToUtf8(title.toString())}`;
  }
  if (author) {
    url += `&author=${convertToUtf8(author.toString())}`;
  }

  if (title || author) {
    const response = await fetch(url);
    const data = await response.json() as { Items: rakuktenItem[], count: number };

    if (data) {
      const bookList = data.Items.map(extractData);
      res.status(200).json({ data: bookList.sort(compare), size: data.count })
    } else {
      res.status(500).json({ message: 'Something wrong' });
    }
  } else {
    res.status(500).json({ message: 'Error: Please set title or author to query'})
  }
}

export default Rakuten;
