import { useLocale } from '../locale';
import { PanCoreArtwork } from './PanCoreArtwork';

export function SculptureStage() {
  const { t } = useLocale();
  return (
    <div className="sculpture-stage sculpture-stage-nexus">
      <PanCoreArtwork
        label={t(
          'PAN nexus: a graphite and smoked-glass core joined to partner nodes by flowing pink liquid',
          'Ядро PAN из графита и дымчатого стекла, соединённое с партнёрскими узлами розовыми потоками',
        )}
      />
    </div>
  );
}
