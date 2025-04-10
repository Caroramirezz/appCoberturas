namespace Coberturas.Models.Bloomberg
{
  public class BloombergRecord
  {
    public int Id { get; set; }  // Auto-incremented primary key
    public string DLRequestId { get; set; }  // Corresponds to DL_REQUEST_ID in CSV
    public string DLRequestName { get; set; }  // Corresponds to DL_REQUEST_NAME
    public DateTime? DLSnapshotStartTime { get; set; }  // Corresponds to DL_SNAPSHOT_START_TIME, Nullable DateTime
    public string DLSnapshotTz { get; set; }  // Corresponds to DL_SNAPSHOT_TZ
    public string Identifier { get; set; }  // Corresponds to IDENTIFIER in CSV
    public int RC { get; set; }  // Corresponds to RC (status code)
    public double? PXSettle { get; set; }  // Corresponds to PX_SETTLE, Nullable double
    public double? PXClose1D { get; set; }  // Corresponds to PX_CLOSE_1D, Nullable double
    public double? PXClose1YR { get; set; }  // Corresponds to PX_CLOSE_1YR, Nullable double
    public double? PXClose1M { get; set; }  // Corresponds to PX_CLOSE_1M, Nullable double
    public DateTime? LastTradeableDt { get; set; }  // Corresponds to LAST_TRADEABLE_DT, Nullable DateTime
    public double? PXLast { get; set; }  // Corresponds to PX_LAST, Nullable double
    public DateTime LastUpdated { get; set; } = DateTime.Now;  // Automatically set to current timestamp
  }
}
