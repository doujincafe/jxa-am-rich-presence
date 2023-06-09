namespace src_server.Utilities;

public static class Converters
{
    public static byte[] FromHexadecimalToByteArray(string data)
    {
        return Enumerable.Range(0, data.Length)
            .Where(x => x % 2 == 0)
            .Select(x => Convert.ToByte(data.Substring(x, 2), 16))
            .ToArray();
    }

    private static int GetHexVal(char hex) {
        var val = (int)hex;
        return val - (val < 58 ? 48 : (val < 97 ? 55 : 87));
    }
}
