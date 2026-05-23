import { type FormEvent, useMemo, useState } from 'react';
import { createExperiment } from '../../api/experimentationApi';
import { useAppConfig } from '../../state/AppConfigContext';
import type { CreateExperimentRequest, ExperimentResponse } from '../../types/api';
import { parsePlainJsonObject } from '../../security/safeJson';
import { Alert } from '../common/Alert';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { FormField, TextArea, TextInput } from '../common/FormField';
import { ExperimentDetails } from '../ExperimentDetails';

interface VariantDraft {
  key: string;
  weight: number;
  payload: string;
}

const KEY_PATTERN = /^[a-zA-Z0-9_.-]+$/;

const initialVariants: VariantDraft[] = [
  { key: 'control', weight: 5000, payload: `{
  "color": "blue"
}` },
  { key: 'variant_a', weight: 5000, payload: `{
  "color": "green"
}` }
];

export function CreateExperimentForm() {
  const { apiBaseUrl, adminToken } = useAppConfig();
  const [key, setKey] = useState('homepage_hero_copy');
  const [name, setName] = useState('Homepage Hero Copy');
  const [enabled, setEnabled] = useState(true);
  const [trafficAllocationBp, setTrafficAllocationBp] = useState(10000);
  const [variants, setVariants] = useState<VariantDraft[]>(initialVariants);
  const [created, setCreated] = useState<ExperimentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalWeight = useMemo(() => variants.reduce((sum, variant) => sum + Number(variant.weight || 0), 0), [variants]);

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((current) => current.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)));
  }

  function removeVariant(index: number) {
    setVariants((current) => current.filter((_, i) => i !== index));
  }

  function addVariant() {
    setVariants((current) => [...current, { key: `variant_${current.length}`, weight: 1000, payload: `{
  "enabled": true
}` }]);
  }

  function buildRequest(): CreateExperimentRequest {
    const normalizedKey = key.trim();
    const normalizedName = name.trim();
    if (!adminToken.trim()) throw new Error('Admin token is required to create experiments. Configure it in Settings.');
    if (!normalizedName) throw new Error('Experiment name is required.');
    if (!KEY_PATTERN.test(normalizedKey)) throw new Error('Experiment key may contain only letters, numbers, dot, dash, and underscore.');
    if (trafficAllocationBp < 1 || trafficAllocationBp > 10000) throw new Error('Traffic allocation must be between 1 and 10000 basis points.');
    if (variants.length === 0 || variants.length > 20) throw new Error('Experiment must contain 1 to 20 variants.');
    if (totalWeight !== 10000) throw new Error('Variant weights must sum to exactly 10000 basis points.');
    const variantKeys = variants.map((variant) => variant.key.trim());
    if (new Set(variantKeys).size !== variantKeys.length) throw new Error('Variant keys must be unique.');

    return {
      key: normalizedKey,
      name: normalizedName,
      enabled,
      trafficAllocationBp,
      variants: variants.map((variant) => {
        const normalizedVariantKey = variant.key.trim();
        if (!KEY_PATTERN.test(normalizedVariantKey)) throw new Error(`Variant key ${variant.key} has invalid characters.`);
        return {
          key: normalizedVariantKey,
          weight: Number(variant.weight),
          payload: parsePlainJsonObject(variant.payload)
        };
      })
    };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await createExperiment({ apiBaseUrl, adminToken }, buildRequest());
      setCreated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create experiment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Create experiment" subtitle="Admin endpoint protected by X-Admin-Token. Payloads must be JSON objects.">
      <form onSubmit={submit} className="stack">
        {!adminToken.trim() && <Alert tone="warning">Admin token is not configured. Open Settings before creating an experiment.</Alert>}
        <div className="form-grid form-grid--three">
          <FormField label="Experiment key">
            <TextInput value={key} onChange={(e) => setKey(e.target.value)} required maxLength={120} />
          </FormField>
          <FormField label="Name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} required maxLength={240} />
          </FormField>
          <FormField label="Traffic allocation BP" hint="10000 = 100%">
            <TextInput type="number" min={1} max={10000} value={trafficAllocationBp} onChange={(e) => setTrafficAllocationBp(Number(e.target.value))} required />
          </FormField>
        </div>
        <label className="switch-line">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          <span>Experiment enabled</span>
        </label>
        <div className="variant-editor">
          <div className="variant-editor__header">
            <strong>Variants</strong>
            <span className={totalWeight === 10000 ? 'text-success' : 'text-danger'}>Total weight: {totalWeight}/10000</span>
          </div>
          {variants.map((variant, index) => (
            <div className="variant-editor__row" key={`${variant.key}-${index}`}>
              <FormField label="Variant key">
                <TextInput value={variant.key} onChange={(e) => updateVariant(index, { key: e.target.value })} required />
              </FormField>
              <FormField label="Weight BP">
                <TextInput type="number" min={1} max={10000} value={variant.weight} onChange={(e) => updateVariant(index, { weight: Number(e.target.value) })} required />
              </FormField>
              <FormField label="Payload JSON">
                <TextArea value={variant.payload} onChange={(e) => updateVariant(index, { payload: e.target.value })} rows={5} required />
              </FormField>
              <Button type="button" variant="ghost" onClick={() => removeVariant(index)} disabled={variants.length <= 1}>Remove</Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addVariant}>Add variant</Button>
        </div>
        {error && <Alert tone="danger">{error}</Alert>}
        <div className="form-actions"><Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create experiment'}</Button></div>
      </form>
      {created && <ExperimentDetails experiment={created} />}
    </Card>
  );
}
