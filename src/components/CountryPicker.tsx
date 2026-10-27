import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Plus, X } from 'lucide-react';
import { markets } from '../data';
import { countryGroups, findRegion, regionForCountry } from '../geography';
import { useLocale } from '../locale';

export function CountryPicker({
  selected,
  onToggle,
  limit = 3,
}: {
  selected: string[];
  onToggle: (slug: string) => void;
  limit?: number;
}) {
  const { language, t } = useLocale();
  const [params] = useSearchParams();
  const regionQuery = findRegion(params.get('region'))?.id || '';
  const [region, setRegion] = useState<string>(regionQuery);
  useEffect(() => setRegion(regionQuery), [regionQuery]);
  const groups = countryGroups(markets, language);
  return (
    <div className="country-picker">
      <div
        className="country-region-tabs"
        role="group"
        aria-label={t('Country regions', 'Регионы стран')}
      >
        <button type="button" aria-pressed={!region} onClick={() => setRegion('')}>
          {t('All regions', 'Все регионы')}
        </button>
        {groups.map((group) => (
          <button
            type="button"
            key={group.id}
            aria-pressed={region === group.id}
            onClick={() => setRegion(group.id)}
          >
            {t(group.name, group.ru)}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <div
          className="selected-countries"
          aria-label={t('Selected countries', 'Выбранные страны')}
        >
          {selected.map((slug) => {
            const country = markets.find((item) => item.slug === slug);
            if (!country) return null;
            const area = regionForCountry(slug)!;
            return (
              <button
                type="button"
                key={slug}
                onClick={() => onToggle(slug)}
                aria-label={t(`Remove ${country.name}`, `Убрать: ${country.ru}`)}
              >
                <span>
                  {t(country.name, country.ru)}
                  <small>{t(area.name, area.ru)}</small>
                </span>
                <X size={16} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      )}
      <div className="country-picker-groups">
        {groups
          .filter((group) => !region || group.id === region)
          .map((group) => (
            <section key={group.id} aria-labelledby={`brief-region-${group.id}`}>
              <h3 id={`brief-region-${group.id}`}>{t(group.name, group.ru)}</h3>
              <div
                className="profile-market-picker"
                role="group"
                aria-label={t(`Countries in ${group.name}`, `Страны: ${group.ru}`)}
              >
                {group.countries.map((country) => (
                  <button
                    type="button"
                    key={country.slug}
                    onClick={() => onToggle(country.slug)}
                    aria-pressed={selected.includes(country.slug)}
                    disabled={!selected.includes(country.slug) && selected.length >= limit}
                  >
                    <span>{t(country.name, country.ru)}</span>
                    <small>{country.currency}</small>
                    {selected.includes(country.slug) ? (
                      <Check size={18} aria-hidden="true" />
                    ) : (
                      <Plus size={18} aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))}
      </div>
      <p className="profile-help" role="status">
        {selected.length >= limit
          ? t(
              `You have selected ${limit} countries. Remove one to choose another.`,
              `Выбрано стран: ${limit}. Уберите одну, чтобы выбрать другую.`,
            )
          : t(
              `Choose up to ${limit} countries across any of these regions.`,
              `Выберите до ${limit} стран из этих регионов.`,
            )}
      </p>
    </div>
  );
}
