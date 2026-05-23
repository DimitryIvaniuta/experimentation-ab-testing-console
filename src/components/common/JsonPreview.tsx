import { prettyJson } from '../../security/safeJson';

export function JsonPreview({ value }: { value: unknown }) {
  return <pre className="json-preview">{prettyJson(value)}</pre>;
}
