export type TransitionTable<
  State extends string,
  Event extends string
> = Readonly<
  Partial<Record<State, Readonly<Partial<Record<Event, State>>>>>
>;

export class InvalidTransitionError extends Error {
  readonly machine: string;
  readonly currentState: string;
  readonly event: string;

  constructor(machine: string, currentState: string, event: string) {
    super(`Invalid ${machine} transition: ${currentState} + ${event}`);
    this.name = "InvalidTransitionError";
    this.machine = machine;
    this.currentState = currentState;
    this.event = event;
  }
}

export function transition<State extends string, Event extends string>(
  machine: string,
  table: TransitionTable<State, Event>,
  currentState: State,
  event: Event
): State {
  const byEvent = table[currentState];
  const nextState = byEvent?.[event];
  if (nextState === undefined) {
    throw new InvalidTransitionError(machine, currentState, event);
  }
  return nextState;
}
