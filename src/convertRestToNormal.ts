import { TWpRestApiData, TWpData } from "./types";

const convertRestToNormal = (post:TWpRestApiData) :TWpData => {

  const eyecatch: string = post._embedded ? post._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url : '';

  const data:TWpData = {
    id: post.id,
    date: post.date,
    title: post.title.rendered,
    link: post.link,
    eyecatch,
    acf: post.acf || [],
    categories: post.cat_info || [],
  };

  return data;
}

export default convertRestToNormal;