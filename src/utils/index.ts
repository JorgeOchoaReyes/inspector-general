import moment from "moment-timezone";
export const linkToGithubScope = (date:string) => `https://github.com/settings/tokens/new?description=Inspector+General+(Created on ${date})&scopes=repo,read:org,read:user,user:email`;

export const dateFormat = "MMM d, h:mm a"; 

export const dateToLocal = (date: string) => {
  return moment(date).local(true).format(dateFormat);
};