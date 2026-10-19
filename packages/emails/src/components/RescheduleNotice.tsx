export const RescheduleNotice = (props: { oldStart: string; newStart: string; reason?: string | null }) => {
  return (
    <div style={{ padding: "12px 16px", backgroundColor: "#fef3c7", borderRadius: 6 }}>
      <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Your booking was rescheduled</p>
      <p style={{ fontSize: 13, margin: "4px 0 0" }}>
        From {props.newStart} to {props.oldStart}
      </p>
      <p style={{ fontSize: 13, margin: "4px 0 0" }} dangerouslySetInnerHTML={{ __html: props.reason ?? "" }} />
    </div>
  );
};
