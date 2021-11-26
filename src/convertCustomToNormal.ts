import { TWpData, TWpCustomData } from "./types";

const convertCustomToNormal = (post:TWpCustomData) :TWpData => {

  const data:TWpData = {
    id: post.ID,
    date: post.post_date,
    title: post.post_title,
    link: post.link,
    eyecatch: post.eyecatch,
    acf: post.acf || {},
    categories: post.categories,
 };

  return data;
}

export default convertCustomToNormal;