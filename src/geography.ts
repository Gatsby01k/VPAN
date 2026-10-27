import { markets, type Market, type Region } from './data.ts';

export const regions = [
  { id: 'africa', value: 'Africa', name: 'Africa', ru: 'Африка' },
  { id: 'asia', value: 'Asia', name: 'Asia', ru: 'Азия' },
  { id: 'latam', value: 'LATAM', name: 'Latin America', ru: 'Латинская Америка' },
] as const;
export type RegionId = (typeof regions)[number]['id'];
export const findRegion = (value: string | null | undefined) =>
  regions.find(
    (region) =>
      region.id === value?.toLowerCase() || region.value.toLowerCase() === value?.toLowerCase(),
  );
export const regionForCountry = (country: string) =>
  findRegion(markets.find((item) => item.name === country || item.slug === country)?.region);
export function countryGroups(countries: readonly Market[] = markets, language = 'en') {
  return regions.map((region) => ({
    ...region,
    countries: countries
      .filter((country) => country.region === region.value)
      .sort((a, b) =>
        (language === 'ru' ? a.ru : a.name).localeCompare(
          language === 'ru' ? b.ru : b.name,
          language,
        ),
      ),
  }));
}
export const regionName = (value: Region, language = 'en') => {
  const region = findRegion(value)!;
  return language === 'ru' ? region.ru : region.name;
};
