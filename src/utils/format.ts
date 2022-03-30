import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import PrismicDOM from 'prismic-dom';

const formatDate = (date: Date): string => {
  return format(date, 'dd MMM yyyy', { locale: ptBR });
};

const prismicGetText = (value: any): string => {
  return typeof value === 'string' ? value : PrismicDOM.RichText.asText(value);
};

const prismicGetHtml = (value: any): string => {
  return typeof value === 'string' ? value : PrismicDOM.RichText.asHtml(value);
};

export { formatDate, prismicGetText, prismicGetHtml };
