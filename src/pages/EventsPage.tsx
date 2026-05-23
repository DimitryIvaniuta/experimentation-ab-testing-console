import { Alert } from '../components/common/Alert';
import { TrackEventForm } from '../components/forms/TrackEventForm';

export function EventsPage() {
  return (
    <div className="page-stack">
      <Alert tone="info">Track events only after a user has an assignment. The backend aggregates accepted events by variant.</Alert>
      <TrackEventForm />
    </div>
  );
}
